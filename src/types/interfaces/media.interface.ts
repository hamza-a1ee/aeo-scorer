export interface ISingleMediaUploadResponse {
  url: string;
}

export interface IPresignedUrlPayload {
  file_name: string;
  operation: "GET" | "PUT";
}

export interface IPresignedUrlResponse {
  url: string;
  sanitizedKey: string;
}
