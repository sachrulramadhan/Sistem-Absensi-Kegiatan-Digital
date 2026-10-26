/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { AttendanceRecord, Kegiatan, Instansi, AppConfig } from './types/attendance';
import {
  getAppConfig,
  saveAppConfig,
  getKegiatanList,
  saveKegiatanList,
  getInstansiList,
  saveInstansiList,
  getAttendanceRecords,
  saveAttendanceRecords,
  subscribeToAttendance,
  resetToDefaultInstansi,
} from './services/storageService';
import { initAuth } from './services/googleAuth';
import {
  fetchSpreadsheetAttendance,
  syncKegiatanToSheet,
  syncInstansiToSheet,
  deleteSpreadsheetRecord,
} from './services/googleWorkspace';
import { Header } from './components/Header';
import { AttendanceForm } from './components/AttendanceForm';
import { SuccessReceipt } from './components/SuccessReceipt';
import { AdminDashboard } from './components/AdminDashboard';
import { GoogleIntegrationModal } from './components/GoogleIntegrationModal';
import { LiveScreen } from './components/LiveScreen';

export default function App() {
  // App Config & Data States
  const [config, setConfig] = useState<AppConfig>(getAppConfig());
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>(getKegiatanList());
  const [instansiList, setInstansiList] = useState<Instansi[]>(getInstansiList());
  const [records, setRecords] = useState<AttendanceRecord[]>(getAttendanceRecords());

  // Auth & View States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'peserta' | 'admin' | 'live'>('peserta');
  const [submittedRecord, setSubmittedRecord] = useState<AttendanceRecord | null>(null);
  const [urlKegiatanId, setUrlKegiatanId] = useState<string>('');
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);

  // Subscribe to real-time attendance changes (BroadcastChannel & storage events)
  useEffect(() => {
    const unsubscribe = subscribeToAttendance((updatedRecords) => {
      setRecords(updatedRecords);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Initialize Auth & check URL params
  useEffect(() => {
    // Parse URL query parameters
    const params = new URLSearchParams(window.location.search);
    const kgtParam = params.get('kegiatan');
    const viewParam = params.get('view');

    if (kgtParam) {
      setUrlKegiatanId(kgtParam);
    }

    if (viewParam === 'live') {
      setCurrentView('live');
    } else if (viewParam === 'admin') {
      setCurrentView('admin');
    } else if (kgtParam) {
      setCurrentView('peserta');
    }

    // Initialize Google Firebase Auth
    const unsubscribe = initAuth(
      (user, _token) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Update Config
  const handleUpdateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    saveAppConfig(newConfig);
  };

  // When participant successfully submits attendance
  const handleAttendanceSuccess = (newRecord: AttendanceRecord) => {
    const updated = [newRecord, ...records];
    setRecords(updated);
    saveAttendanceRecords(updated);
    setSubmittedRecord(newRecord);
  };

  // Reset to fill a new attendance
  const handleNewAttendance = () => {
    setSubmittedRecord(null);
  };

  // Kegiatan Handlers
  const handleSaveKegiatan = async (kegiatan: Kegiatan) => {
    const existingIndex = kegiatanList.findIndex((k) => k.id === kegiatan.id);
    let updated: Kegiatan[];
    if (existingIndex >= 0) {
      updated = [...kegiatanList];
      updated[existingIndex] = kegiatan;
    } else {
      updated = [...kegiatanList, kegiatan];
    }
    setKegiatanList(updated);
    saveKegiatanList(updated);

    if (config.spreadsheetId) {
      syncKegiatanToSheet(config.spreadsheetId, updated).catch(console.warn);
    }
  };

  const handleDeleteKegiatan = async (id: string) => {
    const updated = kegiatanList.filter((k) => k.id !== id);
    setKegiatanList(updated);
    saveKegiatanList(updated);

    if (config.spreadsheetId) {
      syncKegiatanToSheet(config.spreadsheetId, updated).catch(console.warn);
    }
  };

  // Instansi Handlers
  const handleSaveInstansi = async (item: Instansi) => {
    const existingIndex = instansiList.findIndex((i) => i.id === item.id);
    let updated: Instansi[];
    if (existingIndex >= 0) {
      updated = [...instansiList];
      updated[existingIndex] = item;
    } else {
      updated = [...instansiList, item];
    }
    setInstansiList(updated);
    saveInstansiList(updated);

    if (config.spreadsheetId) {
      syncInstansiToSheet(config.spreadsheetId, updated).catch(console.warn);
    }
  };

  const handleDeleteInstansi = async (id: string) => {
    const updated = instansiList.filter((i) => i.id !== id);
    setInstansiList(updated);
    saveInstansiList(updated);

    if (config.spreadsheetId) {
      syncInstansiToSheet(config.spreadsheetId, updated).catch(console.warn);
    }
  };

  const handleResetInstansiDefaults = async () => {
    const updated = resetToDefaultInstansi();
    setInstansiList(updated);
    saveInstansiList(updated);

    if (config.spreadsheetId) {
      syncInstansiToSheet(config.spreadsheetId, updated).catch(console.warn);
    }
  };

  // Attendance Record Deletion
  const handleDeleteRecord = async (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    saveAttendanceRecords(updated);

    if (config.spreadsheetId) {
      await deleteSpreadsheetRecord(config.spreadsheetId, id).catch(console.warn);
    }
  };

  // Refresh or sync data from Google Sheets
  const handleRefreshData = async () => {
    if (!config.spreadsheetId) return;
    try {
      const sheetData = await fetchSpreadsheetAttendance(config.spreadsheetId);
      if (sheetData && sheetData.length > 0) {
        // Merge with existing local records by ID
        const mergedMap = new Map<string, AttendanceRecord>();
        // Add local first
        records.forEach((r) => mergedMap.set(r.id, r));
        // Overwrite / add from sheet
        sheetData.forEach((s) => mergedMap.set(s.id, { ...mergedMap.get(s.id), ...s, syncedToGoogleSheets: true }));
        const mergedList = Array.from(mergedMap.values());
        setRecords(mergedList);
        saveAttendanceRecords(mergedList);
      }
    } catch (err) {
      console.warn('Refresh error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onChangeView={(view) => {
          setCurrentView(view);
          if (view === 'peserta') {
            setSubmittedRecord(null);
          }
        }}
        currentUser={currentUser}
        spreadsheetConnected={!!config.spreadsheetId}
        onOpenIntegrationModal={() => setIsIntegrationModalOpen(true)}
      />

      {/* Main Container */}
      {currentView === 'live' ? (
        <LiveScreen
          records={records}
          kegiatanList={kegiatanList}
          selectedKegiatanId={urlKegiatanId}
          onClose={() => setCurrentView('peserta')}
          onSelectKegiatan={(id) => setUrlKegiatanId(id)}
        />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {currentView === 'peserta' ? (
            submittedRecord ? (
              <SuccessReceipt
                record={submittedRecord}
                onNewAttendance={handleNewAttendance}
              />
            ) : (
              <AttendanceForm
                kegiatanList={kegiatanList}
                instansiList={instansiList}
                initialKegiatanId={urlKegiatanId}
                onSuccess={handleAttendanceSuccess}
              />
            )
          ) : (
            <AdminDashboard
              currentUser={currentUser}
              config={config}
              records={records}
              kegiatanList={kegiatanList}
              instansiList={instansiList}
              onUpdateConfig={handleUpdateConfig}
              onSaveKegiatan={handleSaveKegiatan}
              onDeleteKegiatan={handleDeleteKegiatan}
              onSaveInstansi={handleSaveInstansi}
              onDeleteInstansi={handleDeleteInstansi}
              onDeleteRecord={handleDeleteRecord}
              onRefreshData={handleRefreshData}
              onSelectEventForAttendance={(id) => {
                setUrlKegiatanId(id);
                setCurrentView('peserta');
                setSubmittedRecord(null);
              }}
              onOpenLiveScreen={(id) => {
                if (id) setUrlKegiatanId(id);
                setCurrentView('live');
              }}
              onResetInstansiDefaults={handleResetInstansiDefaults}
            />
          )}
        </main>
      )}

      {/* Global Google Integration Modal (accessible from header) */}
      {isIntegrationModalOpen && (
        <GoogleIntegrationModal
          isOpen={isIntegrationModalOpen}
          currentUser={currentUser}
          config={config}
          records={records}
          onClose={() => setIsIntegrationModalOpen(false)}
          onUpdateConfig={handleUpdateConfig}
          onRefreshData={handleRefreshData}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/70 backdrop-blur-xs py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Sistem Absensi Digital</span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-slate-500">Google Workspace Edition</span>
          </div>
          <div className="text-slate-400">
            Database: Google Sheets · Penyimpanan: Google Drive · Ekspor: Excel (.xlsx)
          </div>
        </div>
      </footer>
    </div>
  );
}
