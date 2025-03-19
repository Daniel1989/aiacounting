'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Camera, Upload, Check, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  userId: string;
}

interface RecognizedItem {
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  date?: string;
  selected: boolean;
}

export function ImageUpload({ userId }: ImageUploadProps) {
  const t = useTranslations('imageUpload');
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'en';
  
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [recognizedItems, setRecognizedItems] = useState<RecognizedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      setError(null);
      
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload image
      const uploadResponse = await fetch(`/${locale}/api/upload-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      
      const uploadData = await uploadResponse.json();
      setImageUrl(uploadData.url);
      
      // Analyze the receipt
      setIsAnalyzing(true);
      const analyzeResponse = await fetch(`/${locale}/api/analyze-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: uploadData.url,
          locale,
        }),
      });
      
      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        throw new Error(errorData.error || 'Failed to analyze receipt');
      }
      
      const analyzeData = await analyzeResponse.json();
      
      if (!analyzeData.isReceipt) {
        setError(analyzeData.message || t('notAReceipt'));
        setRecognizedItems([]);
      } else {
        // Add selected property to each item
        const itemsWithSelection = analyzeData.items.map((item: any) => ({
          ...item,
          selected: true,
        }));
        setRecognizedItems(itemsWithSelection);
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const toggleItemSelection = (index: number) => {
    setRecognizedItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, selected: !item.selected } : item
      )
    );
  };
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Filter selected items
      const selectedItems = recognizedItems.filter(item => item.selected);
      
      if (selectedItems.length === 0) {
        setError(t('noItemsSelected'));
        return;
      }
      
      // Submit selected items
      const response = await fetch(`/${locale}/api/batch-insert-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: selectedItems,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save records');
      }
      
      const data = await response.json();
      setSuccess(t('recordsSaved', { count: data.insertedCount }));
      
      // Reset state
      setImageUrl(null);
      setRecognizedItems([]);
      
      // Refresh the page after a delay to show updated records
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err) {
      console.error('Error saving records:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    setImageUrl(null);
    setRecognizedItems([]);
    setError(null);
    setSuccess(null);
  };
  
  return (
    <div className="mt-4 mb-8">
      {/* Upload button */}
      {!imageUrl && (
        <div className="flex justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isAnalyzing}
            className="flex items-center gap-2 text-sm px-6 py-2 bg-blue-100 border-2 border-blue-200 rounded-lg text-gray-800 hover:bg-blue-200 transition-colors"
          >
            {isUploading || isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            {t('uploadReceipt')}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={isUploading || isAnalyzing}
          />
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}
      
      {/* Success message */}
      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
          {success}
        </div>
      )}
      
      {/* Image preview */}
      {imageUrl && (
        <div className="mt-4">
          {/* <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
            <Image
              src={imageUrl}
              alt="Receipt"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div> */}
          
          {/* Loading indicator for analysis */}
          {isAnalyzing && (
            <div className="mt-4 flex flex-col items-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <p className="mt-2 text-sm text-gray-600">{t('analyzingReceipt')}</p>
            </div>
          )}
          
          {/* Recognized items */}
          {recognizedItems.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-800 mb-2">{t('recognizedItems')}</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">{t('description')}</th>
                      <th className="px-4 py-2 text-left">{t('amount')}</th>
                      <th className="px-4 py-2 text-left">{t('type')}</th>
                      <th className="px-4 py-2 text-left">{t('category')}</th>
                      <th className="px-4 py-2 text-center">{t('include')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recognizedItems.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{item.description}</td>
                        <td className="px-4 py-2">¥{item.amount.toFixed(2)}</td>
                        <td className="px-4 py-2">
                          {item.type === 'expense' ? t('expense') : t('income')}
                        </td>
                        <td className="px-4 py-2">{item.category}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => toggleItemSelection(index)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              item.selected
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {item.selected ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Action buttons */}
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-blue-600 rounded-md text-white hover:bg-blue-700 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {t('saveRecords')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 