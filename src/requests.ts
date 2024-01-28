// See https://developer.nokotime.com/v2/current_user/
// Example
// {
//   "id": 5538,
//   "email": "john.test@test.com",
//   "first_name": "John",
//   "last_name": "Test",
//   "profile_image_url": "https://api.nokotime.com/images/avatars/0000/0001/avatar.jpg",
//   "url": "https://api.nokotime.com/v2/users/5538",
//   "state": "active",
//   "role": "leader",
//   "entries": 0,
//   "entries_url": "https://api.nokotime.com/v2/users/5538/entries",
//   "expenses": 0,
//   "expenses_url": "https://api.nokotime.com/v2/users/5538/expenses",
//   "time_format": "fraction",
//   "week_start": "Sunday",
//   "utc_offset": -28800,
//   "send_personal_weekly_report_email": true,
//   "send_team_weekly_report_email": true,
//   "created_at": "2010-06-09T20:44:57Z",
//   "updated_at": "2010-06-09T20:44:57Z"
// }
export interface INokoGetCurrentUserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  url: string;
  state: string;
  role: string;
  entries: number;
  entries_url: string;
  expenses: 0;
  expenses_url: string;
  time_format: string;
  week_start: string;
  utc_offset: number;
  send_personal_weekly_report_email: boolean;
  send_team_weekly_report_email: boolean;
  created_at: string;
  updated_at: string;
}

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
