import { toShortIsoDate } from "@/format";
import { INokoPostEntryRequest, INokoPutEntryRequest } from "@/requests";
import { INokoGetEntryResponse, INokoPostEntryResponse } from "@/responses";

export default class NokoClient {
  private baseUrl: string;
  private userAgent: string;
  private token: string;

  constructor(token: string) {
    this.baseUrl = "https://api.nokotime.com/v2";
    this.userAgent = "keepi-vue/1.0";
    this.token = token;
  }

  public async getEntries(
    userId: number,
    // Inclusive
    from: Date,
    // Inclusive
    to: Date
  ): Promise<INokoGetEntryResponse[]> {
    const options = this.getBaseRequestOptions();
    options.method = "GET";

    const response = await this.makeRequest(
      `/entries?user_ids=${userId}&from=${toShortIsoDate(
        from
      )}&to=${toShortIsoDate(to)}`,
      options
    );
    return await response.json();
  }

  public async createEntry(
    body: INokoPostEntryRequest
  ): Promise<INokoPostEntryResponse> {
    const options = this.getBaseRequestOptions("application/json");
    options.method = "POST";
    options.body = JSON.stringify(body);

    const response = await this.makeRequest("/entries", options);
    return await response.json();
  }

  public async updateEntry(
    id: number,
    body: INokoPutEntryRequest
  ): Promise<void> {
    const options = this.getBaseRequestOptions("application/json");
    options.method = "PUT";
    options.body = JSON.stringify(body);

    await this.makeRequest(`/entries/${id}`, options);
  }

  public async deleteEntry(id: number): Promise<void> {
    const options = this.getBaseRequestOptions();
    options.method = "DELETE";
    await this.makeRequest(`/entries/${id}`, options);
  }

  private async makeRequest(
    subpath: string,
    options?: RequestInit
  ): Promise<Response> {
    // TODO debounce this to 1 request per 500ms
    // See https://developer.nokotime.com/v2/#rate-limiting
    const response = await fetch(`${this.baseUrl}/${subpath}`, options);
    if (!response.ok) {
      console.error(response.status, await response.text());
      throw Error("Unexpected response");
    }

    return response;
  }

  private getBaseRequestOptions(contentType?: string): RequestInit {
    const headers: [string, string][] = [
      ["User-Agent", this.userAgent],
      ["X-NokoToken", this.token],
    ];

    if (!!contentType) {
      headers.push(["Content-Type", contentType]);
    }

    return {
      headers: headers,
    };
  }
}
