import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCollectionsWithStats } from '@/services/collections.service';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import CashCollectionUI from '@/components/admin/CashCollectionUI';
import CreateCollectionDialog from '@/components/admin/CreateCollectionDialog';
import EditCollectionDialog from '@/components/admin/EditCollectionDialog';
import { Plus, ChevronRight, ArrowLeft, MoreHorizontal, Edit2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function CollectionsTab() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState<any | null>(null);

  const { data: collections, isLoading } = useQuery({
    queryKey: ['collectionsStats'],
    queryFn: fetchCollectionsWithStats
  });

  // Show cash collection detail view
  if (selectedCollectionId) {
    const collection = collections?.find((c: any) => c.id === selectedCollectionId);
    if (!collection) return null;

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => setSelectedCollectionId(null)}
          className="text-slate-600 hover:text-slate-900 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>

        <CashCollectionUI collection={collection} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Collections</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage funding requirements for the batch.</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700 shadow-sm shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Create New Collection
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 px-4 flex items-center justify-between text-sm text-blue-700">
        <span className="font-medium">Active Collections</span>
        <span className="hidden sm:inline">👉 Click a collection below to collect cash</span>
        <span className="sm:hidden">👉 Tap to manage</span>
      </div>

      {/* Collections List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading collections...</div>
      ) : (
        <div className="grid gap-4">
          {collections?.map((cStats: any) => {
            const percentage = cStats.total_users > 0 ? Math.round((cStats.paid_count / cStats.total_users) * 100) : 0;
            const dueDate = new Date(cStats.due_date).toLocaleDateString('en-LK', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <Card
                key={cStats.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => setSelectedCollectionId(cStats.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-3 mb-1">
                        <CardTitle className="text-base font-semibold text-slate-800 truncate">
                          {cStats.title}
                        </CardTitle>
                        <StatusBadge status={cStats.status} />
                      </div>
                      <p className="text-sm text-slate-500 truncate pr-8">{cStats.description}</p>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                        <span>
                          <span className="font-medium text-slate-700">Rs. {cStats.amount_per_person.toLocaleString()}</span> /person
                        </span>
                        <span>Due: {dueDate}</span>
                        <span>
                          <span className="font-medium text-emerald-600">{cStats.paid_count}</span>/{cStats.total_users} paid
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 max-w-md">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-8 w-8 -m-2 z-10 hover:bg-slate-100" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4 text-slate-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 z-50">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setCollectionToEdit(cStats); }}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Collection
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <ChevronRight className="h-5 w-5 text-slate-300 mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {collections?.length === 0 && (
            <div className="text-center py-12 text-slate-500">No collections found. Create your first one.</div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <CreateCollectionDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      
      {/* Edit Dialog */}
      <EditCollectionDialog 
        open={!!collectionToEdit} 
        onOpenChange={(open) => !open && setCollectionToEdit(null)} 
        collection={collectionToEdit} 
      />
    </div>
  );
}
