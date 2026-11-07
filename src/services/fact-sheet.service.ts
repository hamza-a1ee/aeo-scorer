import type { IAPIResponse } from '@/types/interfaces/api-response.interface';
import type {
  ICompetitor,
  ICompetitorPayload,
  IFact,
  IFactPatchPayload,
  IFactSheet,
  IRating,
  IRatingPatchPayload,
} from '@/types/interfaces/fact-sheet.interface';

import { APIService } from './base.service';

export class FactSheetService extends APIService {
  public static readonly keyFactory = {
    factSheet: 'fact-sheet',
    updateFact: 'fact-sheet-update-fact',
    addCompetitor: 'fact-sheet-add-competitor',
    removeCompetitor: 'fact-sheet-remove-competitor',
    updateRating: 'fact-sheet-update-rating',
  };

  async getFactSheet(scanId: string): Promise<IAPIResponse<IFactSheet>> {
    return (await this.get(`/scans/${scanId}/facts`)).data;
  }

  async updateFact(
    scanId: string,
    factId: number,
    data: IFactPatchPayload,
  ): Promise<IAPIResponse<IFact>> {
    return (await this.patch(`/scans/${scanId}/facts/${factId}`, data)).data;
  }

  async addCompetitor(
    scanId: string,
    data: ICompetitorPayload,
  ): Promise<IAPIResponse<ICompetitor>> {
    return (await this.post(`/scans/${scanId}/competitors`, data)).data;
  }

  async removeCompetitor(
    scanId: string,
    competitorId: number,
  ): Promise<IAPIResponse<{ id: number }>> {
    return (await this.delete(`/scans/${scanId}/competitors/${competitorId}`))
      .data;
  }

  async updateRating(
    scanId: string,
    data: IRatingPatchPayload,
  ): Promise<IAPIResponse<IRating>> {
    return (await this.patch(`/scans/${scanId}/ratings`, data)).data;
  }
}

export const factSheetService = new FactSheetService();
