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
