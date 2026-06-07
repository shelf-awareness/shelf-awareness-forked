'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import type { Produce } from '@prisma/client';

import { getRecommendedProduce } from '@/app/actions/recommendationActions';
import RecommendedItemsList from './RecommendedItemsList';
import RecommendedSettingsModal from './RecommendedSettingsModal';
import AddToShoppingListModal from './AddToShoppingListModal';

interface RecommendedWidgetProps {
  owner: string;
  shoppingLists: any[];
}

export default function RecommendedWidget({ owner, shoppingLists }: RecommendedWidgetProps) {
  const [recommended, setRecommended] = useState<Produce[]>([]);
  const [settings, setSettings] = useState({ lowStock: 2, expDays: 5 });

  const [showSettings, setShowSettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Produce | null>(null);

  const loadLocalSettings = useCallback(() => ({
    lowStock: Number(localStorage.getItem('recommended_lowStock') ?? 2),
    expDays: Number(localStorage.getItem('recommended_expDays') ?? 5),
  }), []);

  const loadData = useCallback(async () => {
    const s = loadLocalSettings();
    setSettings(s);
    const items = await getRecommendedProduce(owner, s);
    setRecommended(items);
  }, [owner, loadLocalSettings]);

  const handleOpenSettings = useCallback(() => setShowSettings(true), []);
  const handleCloseSettings = useCallback(() => setShowSettings(false), []);

  const handleAdd = useCallback((item: Produce) => {
    setSelectedItem(item);
    setShowAddModal(true);
  }, []);

  const handleCloseAdd = useCallback(() => setShowAddModal(false), []);

  const handleSaveSettings = useCallback(() => loadData(), [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <>
      <div className="p-3 border rounded bg-light">
        <div className="d-flex justify-content-between mb-2">
          <h6 className="mb-0 justify-content-between align-items-left">Recommended Items</h6>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={handleOpenSettings}
          >
            Settings
          </Button>
        </div>

        <RecommendedItemsList items={recommended} onAdd={handleAdd} />
      </div>

      <RecommendedSettingsModal
        show={showSettings}
        onHide={handleCloseSettings}
        currentSettings={settings}
        onSave={handleSaveSettings}
      />

      {selectedItem && (
        <AddToShoppingListModal
          show={showAddModal}
          onHide={handleCloseAdd}
          shoppingLists={shoppingLists}
          sidePanel={false}
          prefillName={selectedItem.name}
        />
      )}
    </>
  );
}
