import type { IAPIResponse } from '@/types/interfaces/api-response.interface';
import type { IFix, IFixSummary } from '@/types/interfaces/fix.interface';

import { APIService } from './base.service';

export class FixService extends APIService {
  public static readonly keyFactory = {
    fixes: 'fixes',
    fix: 'fix',
    regenerate: 'fix-regenerate',
    toggleDone: 'fix-toggle-done',
  };

  async list(token: string): Promise<IAPIResponse<IFixSummary[]>> {
    return (await this.get(`/reports/${token}/fixes`)).data;
  }

  async getFix(token: string, fixId: number): Promise<IAPIResponse<IFix>> {
    return (await this.get(`/reports/${token}/fixes/${fixId}`)).data;
  }

  async regenerate(token: string, fixId: number): Promise<IAPIResponse<IFix>> {
    return (await this.post(`/reports/${token}/fixes/${fixId}/regenerate`))
      .data;
  }

  async setDone(
    token: string,
    fixId: number,
    done: boolean,
  ): Promise<IAPIResponse<IFix>> {
    return (await this.patch(`/reports/${token}/fixes/${fixId}`, { done }))
      .data;
  }
}

export const fixService = new FixService();
