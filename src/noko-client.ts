import { getDifferenceInSeconds } from "@/date";
import { toShortIsoDate } from "@/format";
import { INokoPostEntryRequest, INokoPutEntryRequest } from "@/requests";
import {
  INokoGetEntryResponse,
  INokoGetProjectResponse,
  INokoGetTagResponse,
  INokoPostEntryResponse,
  INokoGetCurrentUserResponse,
} from "@/responses";

export default class NokoClient {
  private baseUrl: string;
  private userAgent: string;

  private token: string;

  private minimumIntervalBetweenRequestsInSeconds = 0.5;
  private lastRequestDateTime: Date;

  // Prefer to use the cached client from the ApplicationStore instead
  // of constructing a new instance. The rate limiting will not function
  // if multiple instances are used.
  constructor(token: string) {
    this.baseUrl = "https://api.nokotime.com/v2";
    this.userAgent = "keepi-vue/1.0";
    this.token = token;

    this.lastRequestDateTime = new Date();
    this.lastRequestDateTime.setDate(new Date().getDate() - 1);
  }

  public getToken(): string {
    return this.token;
  }

  public async getCurrentUser(): Promise<INokoGetCurrentUserResponse> {
    const options = this.getBaseRequestOptions();
    options.method = "GET";

    const response = await this.makeRequest("/current_user/", options);
    return await response.json();
  }

  public async getEntries(
    // Inclusive
    from: Date,
    // Inclusive
    to: Date,
  ): Promise<INokoGetEntryResponse[]> {
    const options = this.getBaseRequestOptions();
    options.method = "GET";

    const response = await this.makeRequest(
      `/current_user/entries?from=${toShortIsoDate(from)}&to=${toShortIsoDate(
        to,
      )}`,
      options,
    );
    return await response.json();
  }

  public async createEntry(
    body: INokoPostEntryRequest,
  ): Promise<INokoPostEntryResponse> {
    const options = this.getBaseRequestOptions("application/json");
    options.method = "POST";
    options.body = JSON.stringify(body);

    const response = await this.makeRequest("/entries", options);
    return await response.json();
  }

  public async updateEntry(
    id: number,
    body: INokoPutEntryRequest,
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

  public async getTags(): Promise<INokoGetTagResponse[]> {
    const options = this.getBaseRequestOptions();
    options.method = "GET";

    const response = await this.makeRequest("/tags/?per_page=1000", options);
    return await response.json();
  }

  public async getEnabledProjects(): Promise<INokoGetProjectResponse[]> {
    const options = this.getBaseRequestOptions();
    options.method = "GET";

    const results: INokoGetProjectResponse[] = [];

    let currentPage = 1;
    const pageSize = 10;
    while (true) {
      const response = await this.makeRequest(
        `/projects/?enabled=true&per_page=${pageSize}&page=${currentPage}`,
        options,
      );
      const responseProjects: INokoGetProjectResponse[] = await response.json();
      results.push(...responseProjects);

      if (responseProjects.length < pageSize) {
        break;
      }
      ++currentPage;
    }

    return results;
  }

  private async makeRequest(
    subpath: string,
    options?: RequestInit,
  ): Promise<Response> {
    await this.RateLimitSelf();

    const response = await fetch(`${this.baseUrl}/${subpath}`, options);
    if (!response.ok) {
      console.error(response.status, await response.text());
      throw Error("Unexpected response");
    }

    return response;
  }

  // See https://developer.nokotime.com/v2/#rate-limiting
  private async RateLimitSelf(): Promise<void> {
    const now = new Date();
    const secondsSinceLastRequest = getDifferenceInSeconds(
      now,
      this.lastRequestDateTime,
    );
    if (secondsSinceLastRequest < 0.5) {
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          (this.minimumIntervalBetweenRequestsInSeconds -
            secondsSinceLastRequest) *
            1000,
        ),
      );
    }

    this.lastRequestDateTime = new Date();
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
      redirect: "follow", // Noko really likes to redirect
    };
  }
}
