'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/primitives/Tabs/Tabs';
import { Eye, Palette } from 'lucide-react';
import { CardPreviewTab } from './components/CardPreviewTab';
import { CardDesignTab } from './components/CardDesignTab';

export default function CardManagementPage() {
  const [activeTab, setActiveTab] = useState('preview');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-warm-900 mb-2">Mi Tarjeta</h1>
        <p className="text-warm-600">Visualiza, personaliza y comparte tu tarjeta de fidelidad</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="w-4 h-4" />
            Vista Previa
          </TabsTrigger>
          <TabsTrigger value="design" className="gap-2">
            <Palette className="w-4 h-4" />
            Diseño
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <CardPreviewTab />
        </TabsContent>

        <TabsContent value="design">
          <CardDesignTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
