import ExcelJS from 'exceljs';
import type { AttendanceRecord, Kegiatan, SignatureSettings } from '../types/attendance';

export interface ExportOptions {
  kegiatan?: Kegiatan;
  filterDate?: string;
  filterInstansi?: string;
  records: AttendanceRecord[];
  signatureSettings?: SignatureSettings;
}

/**
 * Generates and downloads an Excel file fully styled with table borders, header styling,
 * cell background fills, vertical middle alignments, and proper F4 Folio Landscape print setup.
 */
export async function exportAttendanceToExcel(options: ExportOptions): Promise<void> {
  const { kegiatan, records } = options;
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}-${now.getFullYear()}`;

  const eventName = kegiatan ? kegiatan.nama : 'Semua Kegiatan';
  const cleanEventName = eventName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const fileName = `Daftar_Hadir_${cleanEventName}_${dateFormatted}.xlsx`;

  // Create workbook & worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistem Absensi Kegiatan Digital';
  workbook.lastModifiedBy = 'Panitia Pelaksana';
  workbook.created = now;
  workbook.modified = now;

  const worksheet = workbook.addWorksheet('Daftar Hadir', {
    pageSetup: {
      paperSize: 8 as any, // Folio / F4 (215 mm x 330 mm)
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.35,
        right: 0.35,
        top: 0.4,
        bottom: 0.4,
        header: 0.2,
        footer: 0.2,
      },
    },
    views: [{ showGridLines: true }],
  });

  // Column definitions and widths
  worksheet.columns = [
    { key: 'no', width: 6 },
    { key: 'nama', width: 34 },
    { key: 'telepon', width: 22 },
    { key: 'rekening', width: 28 },
    { key: 'instansi', width: 30 },
    { key: 'jabatan', width: 26 },
    { key: 'ttd1', width: 24 },
    { key: 'ttd2', width: 24 },
  ];

  // Common Border Style: Thin Black Border on all 4 sides
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
  };

  // Common Header Fill
  const headerFill: ExcelJS.FillPattern = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' }, // slate-200 / light gray
  };

  // 1. Title Row 1
  worksheet.mergeCells('A1:H1');
  const titleRow1 = worksheet.getCell('A1');
  titleRow1.value = 'DAFTAR HADIR PESERTA';
  titleRow1.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF0F172A' } };
  titleRow1.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 28;

  // 2. Title Row 2: Event Name
  worksheet.mergeCells('A2:H2');
  const titleRow2 = worksheet.getCell('A2');
  titleRow2.value = eventName.toUpperCase();
  titleRow2.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FF047857' } }; // emerald-700
  titleRow2.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).height = 24;

  // Row 3: Empty spacer
  worksheet.getRow(3).height = 12;

  // 3. Table Header (Row 4) with full border & background fill
  const tableHeaderRow = worksheet.getRow(4);
  tableHeaderRow.values = [
    'NO',
    'NAMA LENGKAP',
    'NOMOR TELEPON / WA',
    'NOMOR REKENING / BANK',
    'INSTANSI / UNIT KERJA',
    'JABATAN',
    'TANDA TANGAN (1)',
    'TANDA TANGAN (2)',
  ];
  tableHeaderRow.height = 28;

  for (let col = 1; col <= 8; col++) {
    const cell = tableHeaderRow.getCell(col);
    cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF0F172A' } };
    cell.fill = headerFill;
    cell.border = thinBorder;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  }

  // 4. Data Rows with Borders & Zig-Zag Signatures
  let currentRowIndex = 5;

  records.forEach((record, index) => {
    const no = index + 1;
    const isOdd = no % 2 !== 0;

    const sigCol1 = isOdd ? `${no}. .................................` : '';
    const sigCol2 = !isOdd ? `${no}. .................................` : '';

    const row = worksheet.getRow(currentRowIndex);
    row.values = [
      no,
      record.nama,
      record.noTelepon || '-',
      record.noRekening,
      record.instansi,
      record.jabatan,
      sigCol1,
      sigCol2,
    ];
    row.height = 34; // Generous height for manual signature

    // Apply borders and alignments to each cell
    for (let col = 1; col <= 8; col++) {
      const cell = row.getCell(col);
      cell.border = thinBorder;

      if (col === 1) {
        // NO
        cell.font = { name: 'Calibri', size: 10, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (col === 2) {
        // NAMA
        cell.font = { name: 'Calibri', size: 10.5, bold: true };
        cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      } else if (col === 3 || col === 4) {
        // TELEPON & REKENING
        cell.font = { name: 'Calibri', size: 10 };
        cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      } else if (col === 5 || col === 6) {
        // INSTANSI & JABATAN
        cell.font = { name: 'Calibri', size: 10 };
        cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      } else {
        // TANDA TANGAN (1) & (2)
        cell.font = { name: 'Calibri', size: 10 };
        cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      }
    }

    currentRowIndex++;
  });

  // 6. Additional Blank Rows with Full Borders for Walk-In / Late Attendees
  const additionalBlankRows = 5;
  for (let i = 0; i < additionalBlankRows; i++) {
    const no = records.length + i + 1;
    const isOdd = no % 2 !== 0;

    const sigCol1 = isOdd ? `${no}. .................................` : '';
    const sigCol2 = !isOdd ? `${no}. .................................` : '';

    const row = worksheet.getRow(currentRowIndex);
    row.values = [no, '', '', '', '', '', sigCol1, sigCol2];
    row.height = 34;

    for (let col = 1; col <= 8; col++) {
      const cell = row.getCell(col);
      cell.border = thinBorder;
      if (col === 1) {
        cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF64748B' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else {
        cell.font = { name: 'Calibri', size: 10 };
        cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      }
    }

    currentRowIndex++;
  }

  // 7. Footer Approval Section (Mengetahui & Panitia)
  currentRowIndex += 1; // spacer row
  worksheet.getRow(currentRowIndex).height = 12;

  const { signatureSettings } = options;
  const locationCity = kegiatan?.lokasi ? kegiatan.lokasi.split(' ')[0] : 'Di tempat';
  const customDateText = signatureSettings?.tempatTanggal?.trim() || `${locationCity}, ${dateFormatted}`;

  currentRowIndex += 1;
  const dateRow = worksheet.getRow(currentRowIndex);
  dateRow.height = 18;
  const dateCell = dateRow.getCell(7); // Column G
  dateCell.value = customDateText;
  dateCell.font = { name: 'Calibri', size: 10.5 };

  currentRowIndex += 1;
  const roleRow = worksheet.getRow(currentRowIndex);
  roleRow.height = 20;

  const leftRole = roleRow.getCell(2); // Column B
  leftRole.value = signatureSettings?.judulKiri?.trim() || 'Mengetahui,';
  leftRole.font = { name: 'Calibri', size: 10.5 };

  const rightRole = roleRow.getCell(7); // Column G
  rightRole.value = signatureSettings?.jabatanKanan?.trim() || 'Panitia Pelaksana Kegiatan,';
  rightRole.font = { name: 'Calibri', size: 10.5, bold: true };

  currentRowIndex += 1;
  const titleSubRow = worksheet.getRow(currentRowIndex);
  titleSubRow.height = 18;
  const leftSubRole = titleSubRow.getCell(2);
  leftSubRole.value = signatureSettings?.jabatanKiri?.trim() || 'Penanggung Jawab Acara,';
  leftSubRole.font = { name: 'Calibri', size: 10.5, bold: true };

  // Space for physical signature
  currentRowIndex += 3;
  worksheet.getRow(currentRowIndex - 2).height = 16;
  worksheet.getRow(currentRowIndex - 1).height = 16;
  worksheet.getRow(currentRowIndex).height = 18;

  // Name lines
  const nameRow = worksheet.getRow(currentRowIndex);
  const leftName = nameRow.getCell(2);
  const customLeftName = signatureSettings?.namaKiri?.trim();
  leftName.value = customLeftName ? `( ${customLeftName} )` : '( .................................................... )';
  leftName.font = { name: 'Calibri', size: 10.5, bold: true };

  const rightName = nameRow.getCell(7);
  const customRightName = signatureSettings?.namaKanan?.trim();
  rightName.value = customRightName ? `( ${customRightName} )` : '( .................................................... )';
  rightName.font = { name: 'Calibri', size: 10.5, bold: true };

  // NIP lines
  currentRowIndex += 1;
  const nipRow = worksheet.getRow(currentRowIndex);
  nipRow.height = 18;

  const leftNip = nipRow.getCell(2);
  const customLeftNip = signatureSettings?.nipKiri?.trim();
  leftNip.value = customLeftNip ? `NIP. ${customLeftNip}` : 'NIP.                                                  ';
  leftNip.font = { name: 'Calibri', size: 10 };

  const rightNip = nipRow.getCell(7);
  const customRightNip = signatureSettings?.nipKanan?.trim();
  rightNip.value = customRightNip ? `NIP. ${customRightNip}` : 'NIP.                                                  ';
  rightNip.font = { name: 'Calibri', size: 10 };

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
