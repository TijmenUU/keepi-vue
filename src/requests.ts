// See https://developer.nokotime.com/v2/entries/#create-an-entry
// Example
// {
//   "date": "2012-01-09",
//   "user_id": 5538,
//   "minutes": 60,
//   "description": "noko",
//   "project_id": 37396,
//   "project_name": "Gear GmbH",
//   "source_url": "http://someapp.com/special/url/"
// }
export interface INokoPostEntryRequest {
  date: string;
  // Do not use this. If omitted the authenticated user is automatically used
  user_id?: number;
  minutes: number;
  // This is where hashtags are put as well (space separated)
  description: string;
  project_id: number;
  // Do not use this as it creates the project if no project exits with the
  // name. Use project_id instead.
  project_name?: string;
  source?: string;
}

// See https://developer.nokotime.com/v2/entries/#edit-an-entry
// Example
// {
//   "date": "2012-01-09",
//   "user_id": 5538,
//   "minutes": 60,
//   "description": "noko",
//   "project_id": 37396,
//   "project_name": "Gear GmbH",
//   "source_url": "http://someapp.com/special/url/"
// }
export interface INokoPutEntryRequest {
  date?: string;
  // Do not use this. If omitted the authenticated user is automatically used
  user_id?: number;
  minutes: number;
  // This is where hashtags are put as well (space separated)
  description?: string;
  project_id?: number;
  // Do not use this as it creates the project if no project exits with the
  // name. Use project_id instead.
  project_name?: string;
  source?: string;
}
