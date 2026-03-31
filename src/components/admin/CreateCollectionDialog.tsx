import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCollection } from '@/services/collections.service';
import { useAuth } from '@/context/AuthContext';
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
import { Loader2 } from 'lucide-react';

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCollectionDialog({ open, onOpenChange }: CreateCollectionDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: '',
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return createCollection({
        title: data.title,
        description: data.description,
        amount_per_person: Number(data.amount),
        due_date: data.dueDate,
        created_by: user?.id,
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionsStats'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      onOpenChange(false);
      setFormData({ title: '', description: '', amount: '', dueDate: '' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription>
            Define a new funding requirement. All active batch members will be assigned dues automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Collection Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. EXTRU 2026 Exhibition Contribution" 
              value={formData.title}
              onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              placeholder="Brief description of the funding purpose" 
              value={formData.description}
              onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount per Person (Rs.)</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="0" 
                min="1" 
                value={formData.amount}
                onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input 
                id="dueDate" 
                type="date" 
                value={formData.dueDate}
                onChange={(e) => setFormData(f => ({ ...f, dueDate: e.target.value }))}
                required 
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Collection'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
