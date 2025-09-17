import React, { useState } from 'react';
import UploadMaterials from './UploadMaterials';
import UploadedMaterialsList from './UploadedMaterialsList';

interface MaterialsManagerProps {
    onBack: () => void; // This prop goes back to the main dashboard
}

const MaterialsManager: React.FC<MaterialsManagerProps> = ({ onBack }) => {
    // This state controls whether we see the upload form or the list
    const [view, setView] = useState<'upload' | 'list'>('upload');

    if (view === 'list') {
        // When viewing the list, the "onBack" prop should take us back to the upload form
        return <UploadedMaterialsList onBack={() => setView('upload')} />;
    }

    // By default, show the upload form
    // The main "onBack" prop is used here to exit the whole section
    // The "onViewUploads" prop switches the view to the list
    return <UploadMaterials onBack={onBack} onViewUploads={() => setView('list')} />;
};

export default MaterialsManager;