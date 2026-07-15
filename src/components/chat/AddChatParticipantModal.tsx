import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useGetChatParticipantsQuery } from '@/redux/features/chat/chatApi';
import type { ChatParticipantUser } from '@/types/chat.types';
import { Loader2 } from 'lucide-react';

interface AddChatParticipantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  /** Users already in the room — used to filter out already-added participants */
  currentParticipantIds: string[];
  onSubmit: (userId: string) => Promise<void>;
  isLoading?: boolean;
}

const AddChatParticipantModal = ({
  open,
  onOpenChange,
  roomId,
  currentParticipantIds,
  onSubmit,
  isLoading = false,
}: AddChatParticipantModalProps) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch all users accessible to the current role via the new endpoint
  const { data: allParticipants = [], isLoading: loadingUsers } =
    useGetChatParticipantsQuery(undefined, { skip: !open });

  // Filter out users already in the room
  const availableUsers: ChatParticipantUser[] = allParticipants.filter(
    (u) => !currentParticipantIds.includes(u.id)
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!roomId) {
      setError('Room is not selected.');
      return;
    }
    if (!selectedUserId) {
      setError('Select a user to add.');
      return;
    }

    try {
      await onSubmit(selectedUserId);
      setSelectedUserId('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add participant.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add participant</DialogTitle>
          <DialogDescription>
            Select a user to add to the current chat room.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select a user</Label>

            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
              {loadingUsers ? (
                <div className="flex items-center gap-2 p-3 text-slate-500 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Loading users…
                </div>
              ) : availableUsers.length === 0 ? (
                <p className="text-xs text-slate-500 p-2">
                  No additional users are available to add to this room.
                </p>
              ) : (
                availableUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="participant"
                      checked={selectedUserId === user.id}
                      onChange={() => setSelectedUserId(user.id)}
                      disabled={isLoading}
                      className="h-4 w-4 text-blue-600 border-slate-300"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {user.firstName} {user.lastName}
                        {user.role && (
                          <span className="ml-1.5 text-xs text-slate-400 font-normal">
                            ({user.role})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-xs text-red-700 font-medium">{error}</p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || loadingUsers || !selectedUserId || availableUsers.length === 0}
              className="text-sm bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
                  Adding…
                </>
              ) : (
                'Add Participant'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChatParticipantModal;
