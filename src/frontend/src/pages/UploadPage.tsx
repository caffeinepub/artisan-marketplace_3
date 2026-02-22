import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useCreateItem } from '../hooks/useQueries';
import { ItemType } from '../backend';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, Loader2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { readFileAsUint8Array, yieldToUI } from '../utils/fileProcessing';

const ACCEPTED_FILE_TYPES = {
  image: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  '3d': ['.glb', '.gltf'],
  audio: ['.mp3', '.wav', '.ogg'],
};

const ALL_ACCEPTED_TYPES = [
  ...ACCEPTED_FILE_TYPES.image,
  ...ACCEPTED_FILE_TYPES['3d'],
  ...ACCEPTED_FILE_TYPES.audio,
].join(',');

interface UploadItem {
  file: File;
  title: string;
  description: string;
  price: string;
  itemType: ItemType;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const createItem = useCreateItem();

  const [files, setFiles] = useState<File[]>([]);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const isAuthenticated = !!identity;
  const isArtist = userProfile?.isArtist;

  if (!isAuthenticated || !isArtist) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="font-serif">Access Denied</CardTitle>
            <CardDescription>
              You need to be logged in as an artist to upload items.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/edit-profile' })}>
              Set Up Artist Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    
    const items: UploadItem[] = selectedFiles.map(file => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ''),
      description: '',
      price: '10.00',
      itemType: ItemType.digitalArt,
      status: 'pending',
      progress: 0,
    }));
    
    setUploadItems(items);
  };

  const updateItem = (index: number, updates: Partial<UploadItem>) => {
    setUploadItems(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  };

  const uploadSingleItem = async (item: UploadItem, index: number): Promise<void> => {
    try {
      // Update status to uploading
      updateItem(index, { status: 'uploading', progress: 10 });
      await yieldToUI(10);

      // Validate price
      const price = Math.round(parseFloat(item.price) * 100);
      if (isNaN(price) || price <= 0) {
        throw new Error('Invalid price');
      }

      // Read file asynchronously
      updateItem(index, { progress: 20 });
      await yieldToUI(10);
      
      const blob = await readFileAsUint8Array(item.file);
      
      updateItem(index, { progress: 40 });
      await yieldToUI(10);

      // Upload to backend
      await createItem.mutateAsync({
        title: item.title,
        description: item.description,
        price: BigInt(price),
        itemType: item.itemType,
        blob,
      });

      updateItem(index, { status: 'success', progress: 100 });
      await yieldToUI(10);
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      updateItem(index, { 
        status: 'error', 
        progress: 0,
        error: errorMessage
      });
      await yieldToUI(10);
      throw error;
    }
  };

  const handleUploadAll = async () => {
    setIsUploading(true);

    let successCount = 0;
    let errorCount = 0;

    // Process files sequentially to prevent UI freezing
    for (let i = 0; i < uploadItems.length; i++) {
      const item = uploadItems[i];
      
      // Skip already successful uploads
      if (item.status === 'success') {
        successCount++;
        continue;
      }

      try {
        await uploadSingleItem(item, i);
        successCount++;
      } catch (error) {
        errorCount++;
        // Continue with next file even if one fails
      }

      // Small delay between uploads to keep UI responsive
      await yieldToUI(100);
    }

    setIsUploading(false);
    
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} item(s)!`);
      if (errorCount === 0) {
        setTimeout(() => navigate({ to: '/my-items' }), 2000);
      }
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} upload(s) failed. You can retry individual items.`);
    }
  };

  const handleRetryItem = async (index: number) => {
    const item = uploadItems[index];
    if (item.status !== 'error') return;

    try {
      await uploadSingleItem(item, index);
      toast.success(`Successfully uploaded ${item.title}!`);
    } catch (error) {
      toast.error(`Failed to upload ${item.title}`);
    }
  };

  const successCount = uploadItems.filter(item => item.status === 'success').length;
  const errorCount = uploadItems.filter(item => item.status === 'error').length;
  const pendingCount = uploadItems.filter(item => item.status === 'pending').length;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl font-bold mb-2">Upload Items</h1>
        <p className="text-muted-foreground mb-8">
          Upload multiple files at once. Each file will create a separate listing.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Files</CardTitle>
            <CardDescription>
              Supported formats: Images (PNG, JPG, GIF, WEBP), 3D Models (GLB, GLTF), Audio (MP3, WAV, OGG)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <Input
                type="file"
                multiple
                accept={ALL_ACCEPTED_TYPES}
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-1">Click to upload files</p>
                <p className="text-sm text-muted-foreground">or drag and drop</p>
              </Label>
            </div>
          </CardContent>
        </Card>

        {uploadItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  {uploadItems.length} {uploadItems.length === 1 ? 'Item' : 'Items'}
                </h2>
                {(successCount > 0 || errorCount > 0) && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {successCount > 0 && <span className="text-green-600">{successCount} successful</span>}
                    {successCount > 0 && errorCount > 0 && <span>, </span>}
                    {errorCount > 0 && <span className="text-destructive">{errorCount} failed</span>}
                  </p>
                )}
              </div>
              <Button 
                onClick={handleUploadAll} 
                disabled={isUploading || (pendingCount === 0 && errorCount === 0)}
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : errorCount > 0 ? (
                  'Retry Failed'
                ) : (
                  'Upload All'
                )}
              </Button>
            </div>

            {uploadItems.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-muted rounded flex items-center justify-center">
                      {item.status === 'success' && <CheckCircle2 className="h-6 w-6 text-green-600" />}
                      {item.status === 'error' && <XCircle className="h-6 w-6 text-destructive" />}
                      {item.status === 'uploading' && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                      {item.status === 'pending' && <Upload className="h-6 w-6 text-muted-foreground" />}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={item.title}
                            onChange={(e) => updateItem(index, { title: e.target.value })}
                            disabled={isUploading || item.status === 'success'}
                          />
                        </div>
                        <div>
                          <Label>Price ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.price}
                            onChange={(e) => updateItem(index, { price: e.target.value })}
                            disabled={isUploading || item.status === 'success'}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateItem(index, { description: e.target.value })}
                          disabled={isUploading || item.status === 'success'}
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Category</Label>
                        <Select
                          value={item.itemType}
                          onValueChange={(value) => updateItem(index, { itemType: value as ItemType })}
                          disabled={isUploading || item.status === 'success'}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ItemType.digitalArt}>Digital Art</SelectItem>
                            <SelectItem value={ItemType.physicalProduct}>Physical Product</SelectItem>
                            <SelectItem value={ItemType.nft}>NFT</SelectItem>
                            <SelectItem value={ItemType.craftItem}>Craft Item</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {item.status === 'uploading' && (
                        <div className="space-y-2">
                          <Progress value={item.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground">Uploading... {item.progress}%</p>
                        </div>
                      )}

                      {item.status === 'error' && (
                        <div className="flex items-center justify-between bg-destructive/10 p-3 rounded">
                          <p className="text-sm text-destructive">{item.error}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetryItem(index)}
                            disabled={isUploading}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Retry
                          </Button>
                        </div>
                      )}

                      {item.status === 'success' && (
                        <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded">
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Successfully uploaded!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
