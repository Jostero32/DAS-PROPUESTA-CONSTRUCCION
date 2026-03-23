import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Obra } from '../entities/Obra';
import { Fase } from '../entities/Fase';
import { Gasto } from '../entities/Gasto';

// ─── Interfaces de respuesta ────────────────────────────────────

interface ResumenObraResponse {
  obra_id: number;
  obra_nombre: string;
  estado: string;
  presupuesto: {
    mano_de_obra: number;
    anticipo_materiales: number;
    total_contrato: number;
  };
  gastos: {
    total_gastado: number;
    cantidad_gastos: number;
    saldo_anticipo: number;
  };
  cobros: {
    total_cobrado: number;
    total_por_cobrar: number;
    fases_cobradas: number;
    fases_pendientes: number;
    fases_en_progreso: number;
    fases_total: number;
    progreso_porcentaje: number;
  };
  balance: {
    ingreso_neto: number;
    rentabilidad_porcentaje: number;
  };
}

interface GastoMensualItem {
  anio: number;
  mes: number;
  mes_nombre: string;
  total: number;
  cantidad: number;
}

interface GastosMensualesResponse {
  anio: number;
  total_anual: number;
  cantidad_anual: number;
  meses: GastoMensualItem[];
}

// ─── Helpers ────────────────────────────────────────────────────

const MESES_ES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function toNum(val: string | number | null | undefined): number {
  if (val === null || val === undefined) return 0;
  return typeof val === 'string' ? parseFloat(val) : val;
}

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

// ─── GET /reportes/resumen-obra/:obraId ─────────────────────────

export const resumenObra = async (req: Request, res: Response): Promise<void> => {
  try {
    const obraId = Number(req.params.obraId);
    const usuarioId = req.user!.id;

    // Verificar propiedad de la obra
    const obra = await AppDataSource.getRepository(Obra).findOne({
      where: { id: obraId, usuario_id: usuarioId },
    });

    if (!obra) {
      res.status(404).json({ message: 'Obra no encontrada' });
      return;
    }

    // Agregar gastos con QueryBuilder
    const gastosAgg = await AppDataSource
      .createQueryBuilder()
      .select('COALESCE(SUM(g.monto), 0)', 'total_gastado')
      .addSelect('COUNT(g.id)', 'cantidad_gastos')
      .from(Gasto, 'g')
      .where('g.obra_id = :obraId', { obraId })
      .getRawOne<{ total_gastado: string; cantidad_gastos: string }>();

    // Agregar fases con QueryBuilder — desglose por estado
    const fasesAgg = await AppDataSource
      .createQueryBuilder()
      .select('f.estado', 'estado')
      .addSelect('COALESCE(SUM(f.monto_a_cobrar), 0)', 'total')
      .addSelect('COUNT(f.id)', 'cantidad')
      .from(Fase, 'f')
      .where('f.obra_id = :obraId', { obraId })
      .groupBy('f.estado')
      .getRawMany<{ estado: string; total: string; cantidad: string }>();

    // Procesar resultados de fases
    let totalCobrado = 0;
    let totalPorCobrar = 0;
    let fasesCobradas = 0;
    let fasesPendientes = 0;
    let fasesEnProgreso = 0;
    let fasesTotal = 0;

    for (const row of fasesAgg) {
      const monto = toNum(row.total);
      const cant = parseInt(row.cantidad, 10);
      fasesTotal += cant;

      if (row.estado === 'cobrada') {
        totalCobrado = monto;
        fasesCobradas = cant;
      } else if (row.estado === 'en_progreso') {
        totalPorCobrar += monto;
        fasesEnProgreso = cant;
      } else {
        totalPorCobrar += monto;
        fasesPendientes = cant;
      }
    }

    // Calcular métricas derivadas
    const presupuesto = toNum(obra.presupuesto_mano_obra);
    const anticipo = toNum(obra.anticipo_materiales);
    const totalGastado = toNum(gastosAgg?.total_gastado);
    const cantidadGastos = parseInt(gastosAgg?.cantidad_gastos || '0', 10);
    const ingresoNeto = totalCobrado - totalGastado;
    const progreso = fasesTotal > 0
      ? round2((fasesCobradas / fasesTotal) * 100)
      : 0;
    const rentabilidad = presupuesto > 0
      ? round2((ingresoNeto / presupuesto) * 100)
      : 0;

    const response: ResumenObraResponse = {
      obra_id: obra.id,
      obra_nombre: obra.nombre,
      estado: obra.estado,
      presupuesto: {
        mano_de_obra: round2(presupuesto),
        anticipo_materiales: round2(anticipo),
        total_contrato: round2(presupuesto + anticipo),
      },
      gastos: {
        total_gastado: round2(totalGastado),
        cantidad_gastos: cantidadGastos,
        saldo_anticipo: round2(anticipo - totalGastado),
      },
      cobros: {
        total_cobrado: round2(totalCobrado),
        total_por_cobrar: round2(totalPorCobrar),
        fases_cobradas: fasesCobradas,
        fases_pendientes: fasesPendientes,
        fases_en_progreso: fasesEnProgreso,
        fases_total: fasesTotal,
        progreso_porcentaje: progreso,
      },
      balance: {
        ingreso_neto: round2(ingresoNeto),
        rentabilidad_porcentaje: rentabilidad,
      },
    };

    res.json(response);
  } catch (e) {
    res.status(500).json({ message: 'Error al generar resumen de obra', error: String(e) });
  }
};

// ─── GET /reportes/gastos-mensuales ─────────────────────────────

export const gastosMensuales = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user!.id;
    const anio = req.query.anio
      ? parseInt(req.query.anio as string, 10)
      : new Date().getFullYear();

    // Agrupar gastos por mes usando QueryBuilder
    // Join: gasto → obra → filtrar por usuario_id y año
    const rows = await AppDataSource
      .createQueryBuilder()
      .select('EXTRACT(MONTH FROM g.fecha)::int', 'mes')
      .addSelect('COALESCE(SUM(g.monto), 0)', 'total')
      .addSelect('COUNT(g.id)', 'cantidad')
      .from(Gasto, 'g')
      .innerJoin(Obra, 'o', 'o.id = g.obra_id')
      .where('o.usuario_id = :usuarioId', { usuarioId })
      .andWhere('EXTRACT(YEAR FROM g.fecha) = :anio', { anio })
      .groupBy('EXTRACT(MONTH FROM g.fecha)')
      .orderBy('mes', 'ASC')
      .getRawMany<{ mes: number; total: string; cantidad: string }>();

    // Construir respuesta con los 12 meses (incluyendo los que tienen 0)
    const mesesMap = new Map<number, { total: number; cantidad: number }>();
    for (const row of rows) {
      mesesMap.set(row.mes, {
        total: toNum(row.total),
        cantidad: parseInt(row.cantidad, 10),
      });
    }

    let totalAnual = 0;
    let cantidadAnual = 0;
    const meses: GastoMensualItem[] = [];

    for (let m = 1; m <= 12; m++) {
      const data = mesesMap.get(m) || { total: 0, cantidad: 0 };
      totalAnual += data.total;
      cantidadAnual += data.cantidad;

      meses.push({
        anio,
        mes: m,
        mes_nombre: MESES_ES[m],
        total: round2(data.total),
        cantidad: data.cantidad,
      });
    }

    const response: GastosMensualesResponse = {
      anio,
      total_anual: round2(totalAnual),
      cantidad_anual: cantidadAnual,
      meses,
    };

    res.json(response);
  } catch (e) {
    res.status(500).json({ message: 'Error al generar reporte de gastos mensuales', error: String(e) });
  }
};
