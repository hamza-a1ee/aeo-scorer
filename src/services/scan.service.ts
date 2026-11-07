import type { IAPIResponse } from '@/types/interfaces/api-response.interface';
import type {
  ICreateScanPayload,
  ICreateScanResponse,
  IScanStatus,
} from '@/types/interfaces/scan.interface';

import { APIService } from './base.service';

export class ScanService extends APIService {
  public static readonly keyFactory = {
    create: 'scan-create',
    status: 'scan-status',
    skip: 'scan-skip',
    rejudge: 'scan-rejudge',
  };

  async createScan(
    data: ICreateScanPayload,
  ): Promise<IAPIResponse<ICreateScanResponse>> {
    return (await this.post('/scans', data)).data;
  }

  async getStatus(id: string): Promise<IAPIResponse<IScanStatus>> {
    return (await this.get(`/scans/${id}`)).data;
  }

  async skip(id: string): Promise<IAPIResponse<{ status: string }>> {
    return (await this.post(`/scans/${id}/skip`)).data;
  }

  async rejudge(id: string): Promise<IAPIResponse<{ status: string }>> {
    return (await this.post(`/scans/${id}/rejudge`)).data;
  }
}

export const scanService = new ScanService();
