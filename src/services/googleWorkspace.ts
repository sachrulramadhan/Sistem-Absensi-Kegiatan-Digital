import { getAccessToken } from './googleAuth';
import type { AttendanceRecord, Kegiatan, Instansi } from '../types/attendance';

export interface WorkspaceSyncResult {
  success: boolean;
  message: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  driveFolderId?: string;
  driveFolderUrl?: string;
}

/**
 * Creates a brand new Google Spreadsheet configured with the 4 tabs:
 * ABSENSI, KEGIATAN, INSTANSI, CONFIG
 */
export async function createAttendanceSpreadsheet(
  title: string = 'ABSENSI KEGIATAN DIGITAL'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Autentikasi Google diperlukan. Silakan login dengan Google terlebih dahulu.');
  }

  const payload = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'ABSENSI',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  'ID',
                  'Timestamp',
                  'Nama',
                  'No Telepon',
                  'No Rekening',
                  'Instansi',
                  'Jabatan',
                  'Kegiatan',
                  'Tanggal',
                  'Jam',
                  'Keterangan',
                  'Tanda Tangan',
                  'Status',
                ].map((val) => ({
                  userEnteredValue: { stringValue: val },
                  userEnteredFormat: {
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                    backgroundColor: { red: 0.1, green: 0.45, blue: 0.35 },
                  },
                })),
              },
            ],
          },
        ],
      },
      {
        properties: {
          title: 'KEGIATAN',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  'ID Kegiatan',
                  'Nama Kegiatan',
                  'Tanggal',
                  'Lokasi',
                  'Batas Mulai',
                  'Batas Selesai',
                  'Status',
                ].map((val) => ({
                  userEnteredValue: { stringValue: val },
                  userEnteredFormat: {
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                    backgroundColor: { red: 0.12, green: 0.32, blue: 0.55 },
                  },
                })),
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'KGT001' } },
                  { userEnteredValue: { stringValue: 'Pelatihan Program Kesehatan Digital' } },
                  { userEnteredValue: { stringValue: '2026-10-24' } },
                  { userEnteredValue: { stringValue: 'Aula Utama Lt. 3' } },
                  { userEnteredValue: { stringValue: '08:00' } },
                  { userEnteredValue: { stringValue: '12:00' } },
                  { userEnteredValue: { stringValue: 'Aktif' } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'KGT002' } },
                  { userEnteredValue: { stringValue: 'Rapat Koordinasi Evaluasi Wilayah' } },
                  { userEnteredValue: { stringValue: '2026-10-25' } },
                  { userEnteredValue: { stringValue: 'Ruang Meeting Melati' } },
                  { userEnteredValue: { stringValue: '09:00' } },
                  { userEnteredValue: { stringValue: '14:00' } },
                  { userEnteredValue: { stringValue: 'Aktif' } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'KGT003' } },
                  { userEnteredValue: { stringValue: 'Workshop Tata Kelola dan Akuntabilitas' } },
                  { userEnteredValue: { stringValue: '2026-10-26' } },
                  { userEnteredValue: { stringValue: 'Auditorium Gedung B' } },
                  { userEnteredValue: { stringValue: '08:30' } },
                  { userEnteredValue: { stringValue: '16:00' } },
                  { userEnteredValue: { stringValue: 'Terjadwal' } },
                ],
              },
            ],
          },
        ],
      },
      {
        properties: {
          title: 'INSTANSI',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: ['ID', 'Nama Instansi', 'Status'].map((val) => ({
                  userEnteredValue: { stringValue: val },
                  userEnteredFormat: {
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                    backgroundColor: { red: 0.35, green: 0.25, blue: 0.5 },
                  },
                })),
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'INS001' } },
                  { userEnteredValue: { stringValue: 'Dinas Kesehatan' } },
                  { userEnteredValue: { stringValue: 'Aktif' } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'INS002' } },
                  { userEnteredValue: { stringValue: 'Puskesmas Kecamatan A' } },
                  { userEnteredValue: { stringValue: 'Aktif' } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'INS003' } },
                  { userEnteredValue: { stringValue: 'Puskesmas Kecamatan B' } },
                  { userEnteredValue: { stringValue: 'Aktif' } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'INS004' } },
                  { userEnteredValue: { stringValue: 'RSUD Kabupaten' } },
                  { userEnteredValue: { stringValue: 'Aktif' } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'INS005' } },
                  { userEnteredValue: { stringValue: 'Bappeda / Litbang' } },
                  { userEnteredValue: { stringValue: 'Aktif' } },
                ],
              },
            ],
          },
        ],
      },
      {
        properties: {
          title: 'CONFIG',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: ['Parameter', 'Value'].map((val) => ({
                  userEnteredValue: { stringValue: val },
                  userEnteredFormat: {
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                    backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
                  },
                })),
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Nama Aplikasi' } },
                  { userEnteredValue: { stringValue: 'Sistem Absensi Kegiatan Digital' } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Status Sistem' } },
                  { userEnteredValue: { stringValue: 'Aktif' } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Tanggal Dibuat' } },
                  { userEnteredValue: { stringValue: new Date().toISOString() } },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message ||
        `Gagal membuat spreadsheet baru (HTTP ${response.status}). Pastikan izin telah diberikan.`
    );
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Creates or gets an "Absensi-Tanda-Tangan" folder in Google Drive
 */
export async function getOrCreateDriveFolder(
  folderName: string = 'Absensi - Arsip Tanda Tangan'
): Promise<{ folderId: string; folderUrl: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Autentikasi Google diperlukan.');

  // Search if folder already exists
  const q = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    q
  )}&fields=files(id,name,webViewLink)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      const existing = searchData.files[0];
      return {
        folderId: existing.id,
        folderUrl: existing.webViewLink || `https://drive.google.com/drive/folders/${existing.id}`,
      };
    }
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Folder penyimpanan otomatis bukti tanda tangan digital Sistem Absensi Kegiatan',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal membuat folder di Google Drive.');
  }

  const created = await createRes.json();
  return {
    folderId: created.id,
    folderUrl: `https://drive.google.com/drive/folders/${created.id}`,
  };
}

/**
 * Uploads participant signature (base64 dataURL) as PNG to Google Drive
 */
export async function uploadSignatureToDrive(
  dataUrl: string,
  fileName: string,
  folderId?: string
): Promise<{ fileId: string; webViewLink: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Akses Google Drive belum diotorisasi.');
  }

  // Convert base64 dataURL to Blob
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/png' });

  // Metadata
  const metadata: any = {
    name: `${fileName}.png`,
    mimeType: 'image/png',
    description: `Tanda Tangan Absensi ID: ${fileName}`,
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  // Multipart upload
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metaHeader = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}`;
  const mediaHeader = `${delimiter}Content-Type: image/png\r\n\r\n`;

  const metaBlob = new Blob([metaHeader], { type: 'text/plain' });
  const mediaHeaderBlob = new Blob([mediaHeader], { type: 'text/plain' });
  const closeBlob = new Blob([closeDelimiter], { type: 'text/plain' });

  const multipartBlob = new Blob([metaBlob, mediaHeaderBlob, blob, closeBlob], {
    type: `multipart/related; boundary=${boundary}`,
  });

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: multipartBlob,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal mengunggah tanda tangan ke Google Drive.');
  }

  const fileData = await uploadRes.json();
  const fileId = fileData.id;
  const webViewLink = fileData.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

  return { fileId, webViewLink };
}

/**
 * Appends a single attendance record to Google Sheets
 */
export async function appendAttendanceToSheet(
  spreadsheetId: string,
  record: AttendanceRecord
): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Autentikasi Google diperlukan.');

  const values = [
    [
      record.id,
      record.timestamp,
      record.nama,
      record.noTelepon || '-',
      record.noRekening,
      record.instansi,
      record.jabatan,
      record.namaKegiatan,
      record.tanggal,
      record.jam,
      record.keterangan || '-',
      record.tandaTanganUrl || '-',
      record.status,
    ],
  ];

  const range = 'ABSENSI!A:M';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal menyimpan absensi ke Google Sheets.');
  }
}

/**
 * Batch syncs multiple attendance records to Google Sheets
 */
export async function syncBatchAttendanceToSheet(
  spreadsheetId: string,
  records: AttendanceRecord[]
): Promise<number> {
  if (records.length === 0) return 0;
  const token = await getAccessToken();
  if (!token) throw new Error('Autentikasi Google diperlukan.');

  const values = records.map((record) => [
    record.id,
    record.timestamp,
    record.nama,
    record.noTelepon || '-',
    record.noRekening,
    record.instansi,
    record.jabatan,
    record.namaKegiatan,
    record.tanggal,
    record.jam,
    record.keterangan || '-',
    record.tandaTanganUrl || '-',
    record.status,
  ]);

  const range = 'ABSENSI!A:M';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal sinkronisasi data ke Google Sheets.');
  }

  return records.length;
}

/**
 * Fetches existing attendance data from Google Sheets
 */
export async function fetchSpreadsheetAttendance(
  spreadsheetId: string
): Promise<AttendanceRecord[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Autentikasi Google diperlukan.');

  const range = 'ABSENSI!A2:M';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal membaca sheet ABSENSI.');
  }

  const data = await res.json();
  const rows = data.values || [];

  return rows
    .filter((row: any[]) => row && row[0])
    .map((row: any[]) => {
      const hasPhone = row.length >= 13;
      return {
        id: row[0] || '',
        timestamp: row[1] || '',
        nama: row[2] || '',
        noTelepon: hasPhone ? row[3] || '' : '',
        noRekening: hasPhone ? row[4] || '' : row[3] || '',
        instansi: hasPhone ? row[5] || '' : row[4] || '',
        jabatan: hasPhone ? row[6] || '' : row[5] || '',
        kegiatanId: '',
        namaKegiatan: hasPhone ? row[7] || '' : row[6] || '',
        tanggal: hasPhone ? row[8] || '' : row[7] || '',
        jam: hasPhone ? row[9] || '' : row[8] || '',
        keterangan: hasPhone ? row[10] || '' : row[9] || '',
        tandaTanganUrl: hasPhone ? row[11] || '' : row[10] || '',
        status: (hasPhone ? row[12] : row[11]) || 'Tepat Waktu',
        syncedToGoogleSheets: true,
      };
    });
}

/**
 * Updates or overwrites KEGIATAN list in spreadsheet
 */
export async function syncKegiatanToSheet(
  spreadsheetId: string,
  kegiatanList: Kegiatan[]
): Promise<void> {
  const token = await getAccessToken();
  if (!token) return;

  const values = [
    ['ID Kegiatan', 'Nama Kegiatan', 'Tanggal', 'Lokasi', 'Batas Mulai', 'Batas Selesai', 'Status'],
    ...kegiatanList.map((k) => [
      k.id,
      k.nama,
      k.tanggal,
      k.lokasi,
      k.jamMulai || '08:00',
      k.jamSelesai || '17:00',
      k.status,
    ]),
  ];

  const range = 'KEGIATAN!A1:G';
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );
}

/**
 * Updates or overwrites INSTANSI list in spreadsheet
 */
export async function syncInstansiToSheet(
  spreadsheetId: string,
  instansiList: Instansi[]
): Promise<void> {
  const token = await getAccessToken();
  if (!token) return;

  const values = [
    ['ID', 'Nama Instansi', 'Status'],
    ...instansiList.map((i) => [i.id, i.nama, i.status]),
  ];

  const range = 'INSTANSI!A1:C';
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );
}

/**
 * Deletes a row or clears data (requires confirmation per guidelines)
 */
export async function deleteSpreadsheetRecord(
  spreadsheetId: string,
  rowId: string
): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;

  // Read all rows to find the row index matching rowId
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/ABSENSI!A:A`;
  const res = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return false;

  const data = await res.json();
  const rows = data.values || [];
  const rowIndex = rows.findIndex((r: string[]) => r[0] === rowId);

  if (rowIndex === -1) return false;

  // Clear that row
  const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/ABSENSI!A${rowIndex + 1}:L${rowIndex + 1}:clear`;
  const clearRes = await fetch(clearUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return clearRes.ok;
}
