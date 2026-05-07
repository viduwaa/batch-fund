import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCollectionDetails, deleteCollection } from '@/services/collections.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2 } from 'lucide-react';

interface EditCollectionDialogProps {
  collection: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditCollectionDialog({ collection, open, onOpenChange }: EditCollectionDialogProps) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: '',
    type: 'standard',
  });

  useEffect(() => {
    if (collection && open) {
      setFormData({
        title: collection.title || '',
        description: collection.description || '',
        amount: collection.amount_per_person?.toString() || '',
        // The due_date arrives as YYYY-MM-DDTHH:mm:ss.sssZ, HTML input needs YYYY-MM-DD
        dueDate: collection.due_date ? collection.due_date.split('T')[0] : '',
        type: collection.collection_type || 'standard',
      });
    }
  }, [collection, open]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return updateCollectionDetails(collection.id, {
        title: data.title,
        description: data.description,
        amount_per_person: Number(data.amount),
        due_date: data.dueDate,
        collection_type: data.type,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionsStats'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      onOpenChange(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return deleteCollection(collection.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionsStats'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      onOpenChange(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this collection? This will also remove all associated contributions forever. This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  if (!collection) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogDescription>
            Modify the collection details or permanently remove it from the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Collection Title</Label>
            <Input 
              id="edit-title" 
              placeholder="e.g. EXTRU 2026 Exhibition Contribution" 
              value={formData.title}
              onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input 
              id="edit-description" 
              placeholder="Brief description of the funding purpose" 
              value={formData.description}
              onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount per Person (Rs.)</Label>
              <Input 
                id="edit-amount" 
                type="number" 
                placeholder="0" 
                min="1" 
                value={formData.amount}
                onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))}
                required={formData.type === 'standard'}
                disabled={formData.type === 'adhoc'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input 
                id="edit-dueDate" 
                type="date" 
                value={formData.dueDate}
                onChange={(e) => setFormData(f => ({ ...f, dueDate: e.target.value }))}
                required 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Collection Type</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={formData.type === 'standard' ? 'default' : 'outline'}
                className={formData.type === 'standard' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                onClick={() => setFormData((f) => ({ ...f, type: 'standard', amount: f.amount || '0' }))}
              >
                Standard (everyone)
              </Button>
              <Button
                type="button"
                variant={formData.type === 'adhoc' ? 'default' : 'outline'}
                className={formData.type === 'adhoc' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                onClick={() => setFormData((f) => ({ ...f, type: 'adhoc', amount: '0' }))}
              >
                Ad-hoc (specific)
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Ad-hoc collections skip the full member list and allow recording custom payments from selected people.
            </p>
          </div>

          <DialogFooter className="pt-4 flex justify-between! w-full">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending || updateMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <><Trash2 className="h-4 w-4 mr-2" /> Delete</>
              )}
            </Button>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateMutation.isPending || deleteMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending || deleteMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
