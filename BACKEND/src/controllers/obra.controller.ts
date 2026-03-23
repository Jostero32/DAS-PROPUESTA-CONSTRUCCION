import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Obra } from '../entities/Obra';
import { Fase } from '../entities/Fase';
import { Gasto } from '../entities/Gasto';
import { generarContratoPDF } from '../services/contrato-pdf.service';

const obraRepo = () => AppDataSource.getRepository(Obra);
const faseRepo = () => AppDataSource.getRepository(Fase);
const gastoRepo = () => AppDataSource.getRepository(Gasto);

// ─── helpers ────────────────────────────────────────────────────

/** Verifica que la obra existe y pertenece al maestro autenticado */
async function findObraDelMaestro(obraId: number, usuarioId: number) {
  return obraRepo().findOne({
    where: { id: obraId, usuario_id: usuarioId },
  });
}

// ─── GET /obras ─────────────────────────────────────────────────

/** Lista las obras del maestro autenticado con resumen de fases y gastos */
export const getMisObras = async (req: Request, res: Response): Promise<void> => {
  try {
    const obras = await obraRepo().find({
      where: { usuario_id: req.user!.id },
      relations: ['cliente', 'fases', 'gastos'],
      order: { created_at: 'DESC' },
    });

    const resumen = obras.map((obra) => ({
      ...obra,
      total_fases: obra.fases.length,
      fases_cobradas: obra.fases.filter((f) => f.estado === 'cobrada').length,
      total_gastado: obra.gastos.reduce((sum, g) => sum + Number(g.monto), 0),
      cliente_nombre: obra.cliente?.nombre,
    }));

    res.json(resumen);
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener obras', error: String(e) });
  }
};

// ─── GET /obras/:id ─────────────────────────────────────────────

/** Detalle completo de una obra: datos + fases (ordenadas) + gastos (por fecha) */
export const getObraDetalle = async (req: Request, res: Response): Promise<void> => {
  try {
    const obra = await obraRepo().findOne({
      where: { id: Number(req.params.id), usuario_id: req.user!.id },
      relations: ['cliente', 'fases', 'gastos'],
    });

    if (!obra) {
      res.status(404).json({ message: 'Obra no encontrada' });
      return;
    }

    obra.fases.sort((a, b) => a.orden - b.orden);
    obra.gastos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    const detalle = {
      ...obra,
      total_fases: obra.fases.length,
      fases_cobradas: obra.fases.filter((f) => f.estado === 'cobrada').length,
      monto_cobrado: obra.fases
        .filter((f) => f.estado === 'cobrada')
        .reduce((sum, f) => sum + Number(f.monto_a_cobrar), 0),
      monto_pendiente: obra.fases
        .filter((f) => f.estado !== 'cobrada')
        .reduce((sum, f) => sum + Number(f.monto_a_cobrar), 0),
      total_gastado: obra.gastos.reduce((sum, g) => sum + Number(g.monto), 0),
      saldo_anticipo: Number(obra.anticipo_materiales) - obra.gastos.reduce((sum, g) => sum + Number(g.monto), 0),
    };

    res.json(detalle);
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener obra', error: String(e) });
  }
};

// ─── POST /obras ────────────────────────────────────────────────

/** Crea una obra asignándola automáticamente al maestro autenticado */
export const crearObra = async (req: Request, res: Response): Promise<void> => {
  try {
    const repo = obraRepo();
    const obra = repo.create({
      ...req.body,
      usuario_id: req.user!.id,
    });
    const saved = await repo.save(obra);
    res.status(201).json(saved);
  } catch (e) {
    res.status(500).json({ message: 'Error al crear obra', error: String(e) });
  }
};

// ─── PUT /obras/:id ─────────────────────────────────────────────

/** Actualiza una obra del maestro autenticado */
export const actualizarObra = async (req: Request, res: Response): Promise<void> => {
  try {
    const repo = obraRepo();
    const obra = await findObraDelMaestro(Number(req.params.id), req.user!.id);

    if (!obra) {
      res.status(404).json({ message: 'Obra no encontrada' });
      return;
    }

    repo.merge(obra, req.body);
    res.json(await repo.save(obra));
  } catch (e) {
    res.status(500).json({ message: 'Error al actualizar obra', error: String(e) });
  }
};

// ─── PATCH /obras/:id/estado ────────────────────────────────────

/** Cambia solo el estado de una obra */
export const cambiarEstado = async (req: Request, res: Response): Promise<void> => {
  try {
    const repo = obraRepo();
    const obra = await findObraDelMaestro(Number(req.params.id), req.user!.id);

    if (!obra) {
      res.status(404).json({ message: 'Obra no encontrada' });
      return;
    }

    obra.estado = req.body.estado;
    res.json(await repo.save(obra));
  } catch (e) {
    res.status(500).json({ message: 'Error al cambiar estado', error: String(e) });
  }
};

// ─── DELETE /obras/:id ──────────────────────────────────────────

/** Elimina una obra del maestro (solo si no tiene fases cobradas) */
export const eliminarObra = async (req: Request, res: Response): Promise<void> => {
  try {
    const obra = await obraRepo().findOne({
      where: { id: Number(req.params.id), usuario_id: req.user!.id },
      relations: ['fases'],
    });

    if (!obra) {
      res.status(404).json({ message: 'Obra no encontrada' });
      return;
    }

    const cobradas = obra.fases.filter((f) => f.estado === 'cobrada').length;
    if (cobradas > 0) {
      res.status(400).json({ message: `No se puede eliminar: tiene ${cobradas} fase(s) cobrada(s)` });
      return;
    }

    await obraRepo().remove(obra);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ message: 'Error al eliminar obra', error: String(e) });
  }
};

// ─── POST /obras/:id/gastos ────────────────────────────────────

/** Agrega un gasto a una obra del maestro */
export const agregarGasto = async (req: Request, res: Response): Promise<void> => {
  try {
    const obra = await findObraDelMaestro(Number(req.params.id), req.user!.id);

    if (!obra) {
      res.status(404).json({ message: 'Obra no encontrada' });
      return;
    }

    const repo = gastoRepo();
    const gasto = repo.create({
      ...req.body,
      obra_id: obra.id,
    });
    const saved = await repo.save(gasto);
    res.status(201).json(saved);
  } catch (e) {
    res.status(500).json({ message: 'Error al agregar gasto', error: String(e) });
  }
};

// ─── GET /obras/:id/gastos ─────────────────────────────────────

/** Lista los gastos de una obra del maestro */
export const listarGastosDeObra = async (req: Request, res: Response): Promise<void> => {
  try {
    const obra = await findObraDelMaestro(Number(req.params.id), req.user!.id);

    if (!obra) {
      res.status(404).json({ message: 'Obra no encontrada' });
      return;
    }

    const gastos = await gastoRepo().find({
      where: { obra_id: obra.id },
      order: { fecha: 'DESC' },
    });

    res.json(gastos);
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener gastos', error: String(e) });
  }
};

// ─── GET /obras/:id/fases ──────────────────────────────────────

/** Lista las fases de una obra ordenadas */
export const listarFasesDeObra = async (req: Request, res: Response): Promise<void> => {
  try {
    const obra = await findObraDelMaestro(Number(req.params.id), req.user!.id);

    if (!obra) {
      res.status(404).json({ message: 'Obra no encontrada' });
      return;
    }

    const fases = await faseRepo().find({
      where: { obra_id: obra.id },
      order: { orden: 'ASC' },
    });

    res.json(fases);
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener fases', error: String(e) });
  }
};

// ─── POST /obras/:id/fases ────────────────────────────────────

/** Agrega una fase a una obra del maestro */
export const agregarFase = async (req: Request, res: Response): Promise<void> => {
  try {
    const obra = await findObraDelMaestro(Number(req.params.id), req.user!.id);

    if (!obra) {
      res.status(404).json({ message: 'Obra no encontrada' });
      return;
    }

    const repo = faseRepo();
    const fase = repo.create({
      ...req.body,
      obra_id: obra.id,
    });
    const saved = await repo.save(fase);
    res.status(201).json(saved);
  } catch (e) {
    res.status(500).json({ message: 'Error al agregar fase', error: String(e) });
  }
};

// ─── PATCH /obras/:id/fases/:faseId ────────────────────────────

/** Actualiza el estado y/o evidencia de una fase (flujo de cobro) */
export const actualizarFaseCobro = async (req: Request, res: Response): Promise<void> => {
  try {
    const obra = await findObraDelMaestro(Number(req.params.id), req.user!.id);

    if (!obra) {
      res.status(404).json({ message: 'Obra no encontrada' });
      return;
    }

    const repo = faseRepo();
    const fase = await repo.findOne({
      where: { id: Number(req.params.faseId), obra_id: obra.id },
    });

    if (!fase) {
      res.status(404).json({ message: 'Fase no encontrada en esta obra' });
      return;
    }

    if (req.body.estado) fase.estado = req.body.estado;
    if (req.body.url_evidencia_foto !== undefined) fase.url_evidencia_foto = req.body.url_evidencia_foto;

    res.json(await repo.save(fase));
  } catch (e) {
    res.status(500).json({ message: 'Error al actualizar fase', error: String(e) });
  }
};

// ─── GET /obras/:id/contrato-pdf ────────────────────────────────

/** Genera y descarga la Hoja de Obra / contrato simplificado en PDF */
export const generarContrato = async (req: Request, res: Response): Promise<void> => {
  try {
    const obra = await obraRepo().findOne({
      where: { id: Number(req.params.id), usuario_id: req.user!.id },
      relations: ['cliente', 'usuario', 'fases'],
    });

    if (!obra) {
      res.status(404).json({ message: 'Obra no encontrada' });
      return;
    }

    const filename = `hoja-obra-${obra.id}-${obra.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const pdfStream = generarContratoPDF(obra as any);
    pdfStream.pipe(res);
  } catch (e) {
    res.status(500).json({ message: 'Error al generar contrato PDF', error: String(e) });
  }
};
