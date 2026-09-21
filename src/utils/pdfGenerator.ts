import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Patient, CensusReportStats } from '../types';
import { calculateHospitalDays, formatPediatricAge, getBedSector } from './helpers';

export const exportCensusToPdf = (
  stats: CensusReportStats,
  patients: Patient[],
  doctorName: string = 'Cirujano Pediátrico'
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const now = new Date();
  const formattedDate = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // --- 1. ENCABEZADO INSTITUCIONAL ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 22, 'F');

  // Franja decorativa celeste
  doc.setFillColor(14, 165, 233); // sky-500
  doc.rect(0, 22, pageWidth, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICIO DE CIRUGÍA PEDIÁTRICA', 14, 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 231, 255);
  doc.text('REPORTE ESTADÍSTICO DIARIO Y CENSO CLÍNICO QUIRÚRGICO (20 CAMAS)', 14, 16);

  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Fecha: ${formattedDate} - ${formattedTime}`, pageWidth - 14, 10, { align: 'right' });
  doc.text(`Responsable: ${doctorName}`, pageWidth - 14, 16, { align: 'right' });

  // --- 2. CUADRO RESUMEN ESTADÍSTICO ---
  let startY = 28;

  // Título de la sección de estadísticas
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text('1. RESUMEN EJECUTIVO Y CENSO DE CAMAS', 14, startY + 4);

  // Tarjetas de Métricas Estadísticas (Bloque 17 Camas + Global)
  const cardY = startY + 7;
  const cardHeight = 22;
  const colWidth = (pageWidth - 28 - 12) / 4; // 4 columnas

  // Tarjeta 1: Censo 17 Camas (Intermedios + Generales)
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.setDrawColor(199, 210, 254); // indigo-200
  doc.roundedRect(14, cardY, colWidth, cardHeight, 2, 2, 'FD');

  doc.setTextColor(67, 56, 202); // indigo-700
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('BLOQUE 17 CAMAS (PRIORITARIO)', 18, cardY + 5.5);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `${stats.census17.occupied} Llenas  /  ${stats.census17.empty} Vacías`,
    18,
    cardY + 12
  );

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Ocupación: ${stats.census17.occupancyRate}% (4 Interm. + 13 Gral.)`, 18, cardY + 18);

  // Tarjeta 2: Desglose por Sectores
  const col2X = 14 + colWidth + 4;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(col2X, cardY, colWidth, cardHeight, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DESGLOSE POR SECTOR', col2X + 4, cardY + 5.5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    `• Intermedios (01-04): ${stats.census17.intermedios.occupied}/4 ocupadas`,
    col2X + 4,
    cardY + 10.5
  );
  doc.text(
    `• Generales (05-17): ${stats.census17.generales.occupied}/13 ocupadas`,
    col2X + 4,
    cardY + 14.5
  );
  doc.text(
    `• Ectópicos (18-20): ${stats.census17.ectopicos.occupied}/3 ocupadas`,
    col2X + 4,
    cardY + 18.5
  );

  // Tarjeta 3: Ocupación Total (20 Camas) y Estancia
  const col3X = col2X + colWidth + 4;
  doc.setFillColor(240, 253, 250); // teal-50
  doc.setDrawColor(204, 251, 241); // teal-200
  doc.roundedRect(col3X, cardY, colWidth, cardHeight, 2, 2, 'FD');

  doc.setTextColor(15, 118, 110);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('OCUPACIÓN GLOBAL SERVICIO', col3X + 4, cardY + 5.5);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`${stats.occupiedBeds} / 20 Camas`, col3X + 4, cardY + 12);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Tasa: ${stats.occupancyRate}% | Estancia media: ${stats.averageDaysStay} d`,
    col3X + 4,
    cardY + 18
  );

  // Tarjeta 4: Triaje Clínico
  const col4X = col3X + colWidth + 4;
  doc.setFillColor(254, 242, 242); // rose-50
  doc.setDrawColor(254, 205, 211); // rose-200
  doc.roundedRect(col4X, cardY, colWidth, cardHeight, 2, 2, 'FD');

  doc.setTextColor(190, 18, 60);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTADO CLÍNICO DE PACIENTES', col4X + 4, cardY + 5.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`🟢 Estables: ${stats.stableCount}`, col4X + 4, cardY + 10.5);
  doc.text(`🟡 En Observación: ${stats.observationCount}`, col4X + 4, cardY + 14.5);
  doc.setTextColor(225, 29, 72);
  doc.text(`🔴 Críticos: ${stats.criticalCount}`, col4X + 4, cardY + 18.5);

  // --- 3. TABLA ESTRUCTURADA DE PACIENTES ---
  const sortedPatients = [...patients].sort((a, b) => a.bedNumber - b.bedNumber);

  const tableRows = sortedPatients.map((p) => {
    const days = calculateHospitalDays(p.admissionDate);
    const sector = getBedSector(p.bedNumber);
    const sectorLabel =
      sector === 'intermedios'
        ? 'Intermedios'
        : sector === 'generales'
        ? 'General'
        : 'Ectópico';

    const statusLabel =
      p.status === 'critico'
        ? 'CRÍTICO'
        : p.status === 'observacion'
        ? 'OBSERVACIÓN'
        : 'ESTABLE';

    const bedCell = `Cama ${String(p.bedNumber).padStart(2, '0')}\n(${sectorLabel})`;
    const patientCell = `${p.firstName} ${p.lastName}\n${formatPediatricAge(
      p.ageYears,
      p.ageMonths
    )} · ${p.gender === 'F' ? 'F' : 'M'}`;
    const stayCell = `${days} días\n(Ing: ${p.admissionDate})`;

    let diagAndSurgery = p.primaryDiagnosis;
    if (p.surgicalProcedure) {
      diagAndSurgery += `\nCirugía: ${p.surgicalProcedure}${
        p.postOpDay !== undefined ? ` (PO D${p.postOpDay})` : ''
      }`;
    }

    const currentPlan = p.currentPlans || 'Sin registrar';
    const pendingPlan = p.pendingPlans || 'Ninguno';

    return [
      bedCell,
      patientCell,
      statusLabel,
      stayCell,
      diagAndSurgery,
      currentPlan,
      pendingPlan,
    ];
  });

  autoTable(doc, {
    startY: cardY + cardHeight + 6,
    head: [
      [
        'CAMA / SECTOR',
        'PACIENTE / EDAD',
        'ESTADO',
        'ESTANCIA',
        'DIAGNÓSTICO / CIRUGÍA',
        'PLAN ACTUAL / EXÁMENES',
        'PLAN PENDIENTE / CRÍTICO',
      ],
    ],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      overflow: 'linebreak',
      valign: 'middle',
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 38, fontStyle: 'bold' },
      2: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 24, halign: 'center' },
      4: { cellWidth: 58 },
      5: { cellWidth: 50 },
      6: { cellWidth: 'auto' },
    },
    didParseCell: (data) => {
      // Color condicional para el estado clínico
      if (data.section === 'body' && data.column.index === 2) {
        const text = String(data.cell.raw);
        if (text.includes('CRÍTICO')) {
          data.cell.styles.textColor = [190, 18, 60]; // rose-700
          data.cell.styles.fillColor = [254, 226, 226]; // rose-100
        } else if (text.includes('OBSERVACIÓN')) {
          data.cell.styles.textColor = [161, 98, 7]; // amber-700
          data.cell.styles.fillColor = [254, 243, 199]; // amber-100
        } else if (text.includes('ESTABLE')) {
          data.cell.styles.textColor = [21, 128, 61]; // green-700
          data.cell.styles.fillColor = [220, 252, 231]; // green-100
        }
      }
    },
    margin: { left: 14, right: 14, bottom: 18 },
  });

  // --- 4. BLOQUE DE VALIDACIÓN Y FIRMAS DE ENTREGA DE GUARDIA ---
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 120;
  let sigY = finalY + 10;
  if (sigY > pageHeight - 38) {
    doc.addPage();
    sigY = 25;
  }

  // Firmas y Validación Médica
  doc.setDrawColor(148, 163, 184); // slate-400
  doc.setLineWidth(0.4);

  const sigWidth = 75;
  const sig1X = 30;
  const sig2X = pageWidth - 30 - sigWidth;

  doc.line(sig1X, sigY + 14, sig1X + sigWidth, sigY + 14);
  doc.line(sig2X, sigY + 14, sig2X + sigWidth, sigY + 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Dr(a). Cirujano(a) Saliente de Guardia', sig1X + sigWidth / 2, sigY + 18, { align: 'center' });
  doc.text('Dr(a). Cirujano(a) Entrante de Guardia', sig2X + sigWidth / 2, sigY + 18, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Firma y Sello · ${doctorName}`, sig1X + sigWidth / 2, sigY + 22, { align: 'center' });
  doc.text('Firma, Sello y Conformidad de Recepción', sig2X + sigWidth / 2, sigY + 22, { align: 'center' });

  // --- 5. PIE DE PÁGINA NUMERADO ---
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Línea separadora
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Sistema de Gestión Clínica - Hospitalización de Cirugía Pediátrica | Documento Oficial de Censo y Entrega de Guardia',
      14,
      pageHeight - 7
    );

    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - 14,
      pageHeight - 7,
      { align: 'right' }
    );
  }

  // Descarga directa del archivo PDF
  const filename = `censo_cirugia_pediatrica_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};
