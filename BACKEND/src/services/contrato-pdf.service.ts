import PDFDocument from 'pdfkit';
import { Obra } from '../entities/Obra';
import { Fase } from '../entities/Fase';
import { Cliente } from '../entities/Cliente';
import { Usuario } from '../entities/Usuario';

// ─── Colores ────────────────────────────────────────────────────
const INDIGO = '#303F9F';
const INDIGO_LIGHT = '#E8EAF6';
const TEAL = '#00796B';
const SLATE_900 = '#0F172A';
const SLATE_600 = '#475569';
const SLATE_400 = '#94A3B8';
const BORDER = '#E2E8F0';
const WHITE = '#FFFFFF';

// ─── Helpers ────────────────────────────────────────────────────
function currency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date?: string | Date | null): string {
  if (!date) return 'Sin definir';
  const d = new Date(date);
  return d.toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });
}

function estadoLabel(estado: string): string {
  const map: Record<string, string> = {
    pendiente: 'Pendiente',
    en_progreso: 'En progreso',
    completada: 'Completada',
    cancelada: 'Cancelada',
    cobrada: 'Cobrada',
  };
  return map[estado] || estado;
}

// ─── Generador principal ────────────────────────────────────────
export function generarContratoPDF(
  obra: Obra & { cliente: Cliente; usuario: Usuario; fases: Fase[] },
): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 50, right: 50 },
    info: {
      Title: `Hoja de Obra - ${obra.nombre}`,
      Author: obra.usuario.nombre,
      Subject: 'Contrato simplificado de obra',
    },
  });

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  let y = doc.y;

  // ─── HEADER ──────────────────────────────────────────────────
  // Barra superior indigo
  doc.rect(0, 0, doc.page.width, 6).fill(INDIGO);

  y = 30;

  // Logo area (icono simulado con texto)
  doc
    .roundedRect(50, y, 44, 44, 8)
    .fill(INDIGO);
  doc
    .fontSize(22)
    .fill(WHITE)
    .text('M', 50, y + 10, { width: 44, align: 'center' });

  // Titulo de la empresa
  doc
    .fontSize(20)
    .fill(INDIGO)
    .font('Helvetica-Bold')
    .text('Constructa', 106, y + 4);
  doc
    .fontSize(9)
    .fill(SLATE_600)
    .font('Helvetica')
    .text('Gestion de Construccion', 106, y + 28);

  // Numero de documento
  doc
    .fontSize(9)
    .fill(SLATE_400)
    .font('Helvetica')
    .text(`DOC-${obra.id.toString().padStart(4, '0')}`, 50 + pageWidth - 100, y + 4, {
      width: 100,
      align: 'right',
    });
  doc
    .text(formatDate(new Date()), 50 + pageWidth - 100, y + 16, {
      width: 100,
      align: 'right',
    });

  y = 90;

  // ─── TITULO DEL DOCUMENTO ────────────────────────────────────
  doc
    .roundedRect(50, y, pageWidth, 36, 6)
    .fill(INDIGO_LIGHT);
  doc
    .fontSize(14)
    .fill(INDIGO)
    .font('Helvetica-Bold')
    .text('HOJA DE OBRA / CONTRATO SIMPLIFICADO', 50, y + 10, {
      width: pageWidth,
      align: 'center',
    });

  y += 52;

  // ─── DATOS DEL MAESTRO Y CLIENTE ─────────────────────────────
  const colWidth = (pageWidth - 16) / 2;

  // Maestro
  doc
    .roundedRect(50, y, colWidth, 80, 6)
    .lineWidth(1)
    .stroke(BORDER);
  doc
    .fontSize(8)
    .fill(SLATE_400)
    .font('Helvetica-Bold')
    .text('MAESTRO MAYOR', 62, y + 10);
  doc
    .fontSize(11)
    .fill(SLATE_900)
    .font('Helvetica-Bold')
    .text(obra.usuario.nombre, 62, y + 24);
  doc
    .fontSize(9)
    .fill(SLATE_600)
    .font('Helvetica')
    .text(obra.usuario.email, 62, y + 40);
  if (obra.usuario.telefono) {
    doc.text(`Tel: ${obra.usuario.telefono}`, 62, y + 54);
  }

  // Cliente
  const clienteX = 50 + colWidth + 16;
  doc
    .roundedRect(clienteX, y, colWidth, 80, 6)
    .lineWidth(1)
    .stroke(BORDER);
  doc
    .fontSize(8)
    .fill(SLATE_400)
    .font('Helvetica-Bold')
    .text('CLIENTE', clienteX + 12, y + 10);
  doc
    .fontSize(11)
    .fill(SLATE_900)
    .font('Helvetica-Bold')
    .text(obra.cliente.nombre, clienteX + 12, y + 24);
  doc
    .fontSize(9)
    .fill(SLATE_600)
    .font('Helvetica');
  if (obra.cliente.telefono) {
    doc.text(`Tel: ${obra.cliente.telefono}`, clienteX + 12, y + 40);
  }
  if (obra.cliente.direccion) {
    doc.text(obra.cliente.direccion, clienteX + 12, y + 54, {
      width: colWidth - 24,
    });
  }

  y += 96;

  // ─── DATOS DE LA OBRA ─────────────────────────────────────────
  doc
    .fontSize(11)
    .fill(INDIGO)
    .font('Helvetica-Bold')
    .text('DATOS DE LA OBRA', 50, y);
  y += 18;

  doc
    .moveTo(50, y)
    .lineTo(50 + pageWidth, y)
    .lineWidth(1)
    .stroke(INDIGO);
  y += 10;

  // Nombre
  doc
    .fontSize(9)
    .fill(SLATE_400)
    .font('Helvetica')
    .text('Nombre de la obra', 50, y);
  doc
    .fontSize(11)
    .fill(SLATE_900)
    .font('Helvetica-Bold')
    .text(obra.nombre, 180, y);
  y += 18;

  // Descripcion
  if (obra.descripcion) {
    doc
      .fontSize(9)
      .fill(SLATE_400)
      .font('Helvetica')
      .text('Descripcion', 50, y);
    doc
      .fontSize(10)
      .fill(SLATE_600)
      .font('Helvetica')
      .text(obra.descripcion, 180, y, { width: pageWidth - 130 });
    y += doc.heightOfString(obra.descripcion, { width: pageWidth - 130, fontSize: 10 }) + 10;
  }

  // Estado
  doc
    .fontSize(9)
    .fill(SLATE_400)
    .font('Helvetica')
    .text('Estado', 50, y);
  doc
    .fontSize(10)
    .fill(TEAL)
    .font('Helvetica-Bold')
    .text(estadoLabel(obra.estado), 180, y);
  y += 18;

  // Fechas
  doc
    .fontSize(9)
    .fill(SLATE_400)
    .font('Helvetica')
    .text('Fecha inicio', 50, y);
  doc
    .fontSize(10)
    .fill(SLATE_900)
    .font('Helvetica')
    .text(formatDate(obra.fecha_inicio), 180, y);

  doc
    .fontSize(9)
    .fill(SLATE_400)
    .text('Fecha fin', 50 + colWidth + 16, y);
  doc
    .fontSize(10)
    .fill(SLATE_900)
    .text(formatDate(obra.fecha_fin), 50 + colWidth + 16 + 80, y);

  y += 28;

  // ─── RESUMEN FINANCIERO ──────────────────────────────────────
  doc
    .fontSize(11)
    .fill(INDIGO)
    .font('Helvetica-Bold')
    .text('RESUMEN FINANCIERO', 50, y);
  y += 18;

  doc
    .moveTo(50, y)
    .lineTo(50 + pageWidth, y)
    .lineWidth(1)
    .stroke(INDIGO);
  y += 12;

  const totalFases = obra.fases.reduce((sum, f) => sum + Number(f.monto_a_cobrar), 0);

  const financeItems = [
    { label: 'Presupuesto mano de obra', value: currency(obra.presupuesto_mano_obra), bold: true },
    { label: 'Anticipo materiales', value: currency(obra.anticipo_materiales), bold: false },
    { label: 'Total fases de cobro', value: currency(totalFases), bold: false },
  ];

  for (const item of financeItems) {
    doc
      .fontSize(10)
      .fill(SLATE_600)
      .font('Helvetica')
      .text(item.label, 62, y);
    doc
      .fontSize(11)
      .fill(SLATE_900)
      .font(item.bold ? 'Helvetica-Bold' : 'Helvetica')
      .text(item.value, 50 + pageWidth - 150, y, { width: 140, align: 'right' });
    y += 20;
  }

  // Linea total
  y += 4;
  doc
    .roundedRect(50, y, pageWidth, 32, 6)
    .fill(INDIGO);
  doc
    .fontSize(11)
    .fill(WHITE)
    .font('Helvetica-Bold')
    .text('VALOR TOTAL DEL CONTRATO', 62, y + 9);
  doc
    .text(
      currency(Number(obra.presupuesto_mano_obra) + Number(obra.anticipo_materiales)),
      50 + pageWidth - 150, y + 9,
      { width: 140, align: 'right' },
    );

  y += 48;

  // ─── TABLA DE FASES ──────────────────────────────────────────
  const fases = [...obra.fases].sort((a, b) => a.orden - b.orden);

  if (fases.length > 0) {
    // Verificar si hay espacio; si no, nueva pagina
    if (y > 600) {
      doc.addPage();
      y = 40;
    }

    doc
      .fontSize(11)
      .fill(INDIGO)
      .font('Helvetica-Bold')
      .text('FASES / HITOS DE COBRO', 50, y);
    y += 18;

    // Header de tabla
    const colNo = 40;
    const colFase = pageWidth - 40 - 100 - 90;
    const colMonto = 100;
    const colEstado = 90;

    doc
      .rect(50, y, pageWidth, 24)
      .fill(INDIGO);

    doc
      .fontSize(8)
      .fill(WHITE)
      .font('Helvetica-Bold');
    doc.text('#', 58, y + 7, { width: colNo, align: 'left' });
    doc.text('FASE', 58 + colNo, y + 7, { width: colFase, align: 'left' });
    doc.text('MONTO', 58 + colNo + colFase, y + 7, { width: colMonto, align: 'right' });
    doc.text('ESTADO', 58 + colNo + colFase + colMonto, y + 7, { width: colEstado - 16, align: 'center' });

    y += 24;

    // Filas
    for (let i = 0; i < fases.length; i++) {
      const fase = fases[i];
      const rowBg = i % 2 === 0 ? '#F8FAFC' : WHITE;

      // Nueva pagina si nos quedamos sin espacio
      if (y > 720) {
        doc.addPage();
        y = 40;
      }

      doc
        .rect(50, y, pageWidth, 26)
        .fill(rowBg);

      doc
        .fontSize(9)
        .fill(SLATE_900)
        .font('Helvetica');
      doc.text(fase.orden.toString(), 58, y + 8, { width: colNo, align: 'left' });
      doc.text(fase.nombre_fase, 58 + colNo, y + 8, { width: colFase, align: 'left' });
      doc
        .font('Helvetica-Bold')
        .text(currency(fase.monto_a_cobrar), 58 + colNo + colFase, y + 8, { width: colMonto, align: 'right' });

      // Badge de estado
      const estadoText = estadoLabel(fase.estado);
      const badgeColor = fase.estado === 'cobrada' ? '#059669' : fase.estado === 'en_progreso' ? '#0369A1' : SLATE_400;
      doc
        .fontSize(7)
        .fill(badgeColor)
        .font('Helvetica-Bold')
        .text(estadoText.toUpperCase(), 58 + colNo + colFase + colMonto, y + 9, {
          width: colEstado - 16,
          align: 'center',
        });

      y += 26;
    }

    // Fila total
    doc
      .rect(50, y, pageWidth, 28)
      .fill(INDIGO_LIGHT);
    doc
      .fontSize(10)
      .fill(INDIGO)
      .font('Helvetica-Bold')
      .text('TOTAL FASES', 58 + colNo, y + 8, { width: colFase, align: 'left' });
    doc
      .text(currency(totalFases), 58 + colNo + colFase, y + 8, { width: colMonto, align: 'right' });

    y += 44;
  }

  // ─── CONDICIONES ──────────────────────────────────────────────
  if (y > 660) {
    doc.addPage();
    y = 40;
  }

  doc
    .fontSize(11)
    .fill(INDIGO)
    .font('Helvetica-Bold')
    .text('CONDICIONES GENERALES', 50, y);
  y += 18;

  doc
    .moveTo(50, y)
    .lineTo(50 + pageWidth, y)
    .lineWidth(0.5)
    .stroke(BORDER);
  y += 10;

  const condiciones = [
    'Los pagos se realizaran segun el avance de cada fase acordada.',
    'El anticipo de materiales se entrega al inicio de la obra y se justifica con recibos.',
    'Cualquier trabajo adicional sera cotizado por separado.',
    'El plazo de ejecucion se cuenta a partir de la fecha de inicio acordada.',
    'Este documento tiene caracter de acuerdo de voluntades entre las partes.',
  ];

  doc
    .fontSize(9)
    .fill(SLATE_600)
    .font('Helvetica');

  for (const cond of condiciones) {
    doc.text(`   •  ${cond}`, 50, y, { width: pageWidth, lineGap: 2 });
    y += 16;
  }

  y += 20;

  // ─── FIRMAS ───────────────────────────────────────────────────
  if (y > 680) {
    doc.addPage();
    y = 40;
  }

  const firmaWidth = (pageWidth - 60) / 2;

  // Linea firma maestro
  doc
    .moveTo(50, y + 40)
    .lineTo(50 + firmaWidth, y + 40)
    .lineWidth(0.5)
    .stroke(SLATE_400);

  doc
    .fontSize(10)
    .fill(SLATE_900)
    .font('Helvetica-Bold')
    .text(obra.usuario.nombre, 50, y + 46, { width: firmaWidth, align: 'center' });
  doc
    .fontSize(8)
    .fill(SLATE_400)
    .font('Helvetica')
    .text('Maestro Mayor', 50, y + 60, { width: firmaWidth, align: 'center' });

  // Linea firma cliente
  const firmaClienteX = 50 + firmaWidth + 60;
  doc
    .moveTo(firmaClienteX, y + 40)
    .lineTo(firmaClienteX + firmaWidth, y + 40)
    .lineWidth(0.5)
    .stroke(SLATE_400);

  doc
    .fontSize(10)
    .fill(SLATE_900)
    .font('Helvetica-Bold')
    .text(obra.cliente.nombre, firmaClienteX, y + 46, { width: firmaWidth, align: 'center' });
  doc
    .fontSize(8)
    .fill(SLATE_400)
    .font('Helvetica')
    .text('Cliente', firmaClienteX, y + 60, { width: firmaWidth, align: 'center' });

  // ─── FOOTER ──────────────────────────────────────────────────
  const footerY = doc.page.height - 30;
  doc
    .fontSize(7)
    .fill(SLATE_400)
    .font('Helvetica')
    .text(
      `Constructa — Documento generado el ${formatDate(new Date())}`,
      50, footerY,
      { width: pageWidth, align: 'center' },
    );

  doc.end();
  return doc;
}
