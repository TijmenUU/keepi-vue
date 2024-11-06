// See https://developer.nokotime.com/v2/entries/#list-entries
// Example
// [
//   {
//     "id": 1,
//     "date": "2012-01-09",
//     "user": {
//       "id": 5538,
//       "email": "john.test@test.com",
//       "first_name": "John",
//       "last_name": "Test",
//       "profile_image_url": "https://api.nokotime.com/images/avatars/0000/0001/avatar.jpg",
//       "url": "https://api.nokotime.com/v2/users/5538"
//     },
//     "billable": true,
//     "minutes": 60,
//     "description": "noko",
//     "project": {
//       "id": 37396,
//       "name": "Gear GmbH",
//       "billing_increment": 10,
//       "enabled": true,
//       "billable": true,
//       "color": "#ff9898",
//       "url": "https://api.nokotime.com/v2/projects/37396"
//     },
//     "tags": [
//       {
//         "id": 249397,
//         "name": "noko",
//         "billable": true,
//         "formatted_name": "#noko",
//         "url": "https://api.nokotime.com/v2/tags/249397"
//       }
//     ],
//     "source_url": "http://someapp.com/special/url/",
//     "invoiced_at": "2012-01-10T08:33:29Z",
//     "invoice": {
//       "id": 12345678,
//       "reference": "AA001",
//       "invoice_date": "2013-07-09",
//       "state": "unpaid",
//       "total_amount": 189.33,
//       "url": "https://api.nokotime.com/v2/invoices/12345678"
//     },
//     "import": {
//       "id": 8910,
//       "url": "https://api.nokotime.com/v2/imports/8910"
//     },
//     "approved_at": "2012-01-10T08:33:29Z",
//     "approved_by": {
//       "id": 5538,
//       "email": "john.test@test.com",
//       "first_name": "John",
//       "last_name": "Test",
//       "profile_image_url": "https://api.nokotime.com/images/avatars/0000/0001/avatar.jpg",
//       "url": "https://api.nokotime.com/v2/users/5538"
//     },
//     "url": "https://api.nokotime.com/v2/entries/1711626",
//     "invoiced_outside_of_noko_url": "https://api.nokotime.com/v2/entries/1711626/marked_as_invoiced",
//     "approved_url": "https://api.nokotime.com/v2/entries/1711626/approved",
//     "unapproved_url": "https://api.nokotime.com/v2/entries/1711626/unapproved",
//     "created_at": "2012-01-09T08:33:29Z",
//     "updated_at": "2012-01-09T08:33:29Z"
//   }
// ]
export interface INokoGetEntryResponse {
  id: number;
  date: string;
  user: {
    id: number;
  };
  minutes: number;
  description?: string;
  project: {
    id: number;
  };
  tags: {
    id: number;
    formatted_name: string;
  }[];
}

// See https://developer.nokotime.com/v2/entries/#create-an-entry
// Example
// {
//   "id": 1,
//   "date": "2012-01-09",
//   "user": {
//     "id": 5538,
//     "email": "john.test@test.com",
//     "first_name": "John",
//     "last_name": "Test",
//     "profile_image_url": "https://api.nokotime.com/images/avatars/0000/0001/avatar.jpg",
//     "url": "https://api.nokotime.com/v2/users/5538"
//   },
//   "billable": true,
//   "minutes": 60,
//   "description": "noko",
//   "project": {
//     "id": 37396,
//     "name": "Gear GmbH",
//     "billing_increment": 10,
//     "enabled": true,
//     "billable": true,
//     "color": "#ff9898",
//     "url": "https://api.nokotime.com/v2/projects/37396"
//   },
//   "tags": [
//     {
//       "id": 249397,
//       "name": "noko",
//       "billable": true,
//       "formatted_name": "#noko",
//       "url": "https://api.nokotime.com/v2/tags/249397"
//     }
//   ],
//   "source_url": "http://someapp.com/special/url/",
//   "invoiced_at": "2012-01-10T08:33:29Z",
//   "invoice": {
//     "id": 12345678,
//     "reference": "AA001",
//     "invoice_date": "2013-07-09",
//     "state": "unpaid",
//     "total_amount": 189.33,
//     "url": "https://api.nokotime.com/v2/invoices/12345678"
//   },
//   "import": {
//     "id": 8910,
//     "url": "https://api.nokotime.com/v2/imports/8910"
//   },
//   "approved_at": "2012-01-10T08:33:29Z",
//   "approved_by": {
//     "id": 5538,
//     "email": "john.test@test.com",
//     "first_name": "John",
//     "last_name": "Test",
//     "profile_image_url": "https://api.nokotime.com/images/avatars/0000/0001/avatar.jpg",
//     "url": "https://api.nokotime.com/v2/users/5538"
//   },
//   "url": "https://api.nokotime.com/v2/entries/1711626",
//   "invoiced_outside_of_noko_url": "https://api.nokotime.com/v2/entries/1711626/marked_as_invoiced",
//   "approved_url": "https://api.nokotime.com/v2/entries/1711626/approved",
//   "unapproved_url": "https://api.nokotime.com/v2/entries/1711626/unapproved",
//   "created_at": "2012-01-09T08:33:29Z",
//   "updated_at": "2012-01-09T08:33:29Z"
// }
export interface INokoPostEntryResponse {
  id: number;
  date: string;
  user: {
    id: number;
  };
  minutes: number;
  description?: string;
  project: {
    id: number;
  };
  tags: {
    id: number;
    name: string;
  }[];
}

// See https://developer.nokotime.com/v2/tags/
// Example
// [
//   {
//     "id": 249397,
//     "name": "noko",
//     "billable": true,
//     "formatted_name": "#noko",
//     "url": "https://api.nokotime.com/v2/tags/249397",
//     "import": {
//       "id": 8910,
//       "url": "https://api.nokotime.com/v2/imports/8910"
//     },
//     "entries": 0,
//     "entries_url": "https://api.nokotime.com/v2/tags/55629/entries",
//     "merge_url": "https://api.nokotime.com/v2/tags/55629/merge",
//     "created_at": "2010-06-09T20:44:57Z",
//     "updated_at": "2010-06-09T20:44:57Z"
//   }
// ]
export interface INokoGetTagResponse {
  id: number;
  name: string;
  formatted_name: string;
}

// See https://developer.nokotime.com/v2/projects/
// Example
// [
//   {
//     "id": 37396,
//     "name": "Gear GmbH",
//     "billing_increment": 10,
//     "enabled": true,
//     "billable": true,
//     "color": "#ff9898",
//     "url": "https://api.nokotime.com/v2/projects/37396",
//     "group": {
//       "id": 3768,
//       "name": "Sprockets, Inc.",
//       "url": "https://api.nokotime.com/v2/project_groups/3768"
//     },
//     "minutes": 180,
//     "billable_minutes": 120,
//     "unbillable_minutes": 60,
//     "invoiced_minutes": 120,
//     "remaining_minutes": 630,
//     "budgeted_minutes": 750,
//     "import": {
//       "id": 8910,
//       "url": "https://api.nokotime.com/v2/imports/8910"
//     },
//     "invoices": [
//       {
//         "id": 12345678,
//         "reference": "AA001",
//         "invoice_date": "2013-07-09",
//         "state": "unpaid",
//         "total_amount": 189.33,
//         "url": "https://api.nokotime.com/v2/invoices/12345678"
//       }
//     ],
//     "participants": [
//       {
//         "id": 5538,
//         "email": "john.test@test.com",
//         "first_name": "John",
//         "last_name": "Test",
//         "profile_image_url": "https://api.nokotime.com/images/avatars/0000/0001/avatar.jpg",
//         "url": "https://api.nokotime.com/v2/users/5538"
//       }
//     ],
//     "entries": 0,
//     "entries_url": "https://api.nokotime.com/v2/projects/37396/entries",
//     "expenses": 0,
//     "expenses_url": "https://api.nokotime.com/v2/projects/37396/expenses",
//     "created_at": "2012-01-09T08:33:29Z",
//     "updated_at": "2012-01-09T08:33:29Z",
//     "merge_url": "https://api.nokotime.com/v2/projects/37396/merge",
//     "archive_url": "https://api.nokotime.com/v2/projects/37396/archive",
//     "unarchive_url": "https://api.nokotime.com/v2/projects/37396/unarchive"
//   }
// ]
export interface INokoGetProjectResponse {
  id: number;
  name: string;
  enabled: boolean;
}

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
