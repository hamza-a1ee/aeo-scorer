import { IDialog } from '@/types/interfaces/dialog.interface';
import { TVoidCallback } from '@/types/types/common/common.type';
import TrashIcon from '@/icons/trash.icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './ui/dialog';
import PrimaryButton from './button/primary-button.component';

interface Props extends IDialog {
  title: string;
  description: string;
  onSubmit: TVoidCallback;
  isLoading: boolean;
}

export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  isLoading,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-sm flex flex-col items-center gap-6 px-6 py-8">
        <div className="flex items-center justify-center size-16 rounded-full bg-red-50">
          <TrashIcon className="size-7" />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <DialogTitle className="text-xl font-semibold text-primary-2">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-test-secondary">
            {description}
          </DialogDescription>
        </div>

        <div className="w-full flex items-center gap-3">
          <PrimaryButton
            variant="goBack"
            type="button"
            onClick={onOpenChange}
            className="w-full"
          >
            Cancel
          </PrimaryButton>
          <PrimaryButton
            onClick={onSubmit}
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </PrimaryButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
