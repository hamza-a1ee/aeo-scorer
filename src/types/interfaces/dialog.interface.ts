import { TVoidCallback } from '../types/common/common.type';

export interface IDialog {
  open: boolean;
  onOpenChange: TVoidCallback;
}
