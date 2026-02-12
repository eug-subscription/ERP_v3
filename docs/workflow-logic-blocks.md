

| Block | Field | Type | Description |
| :---- | :---- | :---- | :---- |
| **Items to shoot prepare** | It does not have its own settings | — | The block waits until a list of Items to shoot appears in the order. I suggest displaying a description here of what this block is and what it does. |
| **SST (Self service tool)** | User Can add new item | Boolean | Can the SST user add their own items |
|  | Domain | Selector | The subdomain on which SST will open/operate |
|  | Pack of resources | Selector | Asset with photo hints from the Splento admin panel |
|  | Single | Bulk submit mode | Switch | Determines whether photos are sent one by one or with a separate Submit button, in bulk (Wolt-like | Uber-like mode) |
|  | Minimum number of photos to submit | Integer | *If \*Single | Bulk submit mode\* is set to Bulk, this field determines at what number of photos the Submit button becomes available* |
| **Pro assign (Добавление фотографа / видеографа в заказ)**  | Who has access | Selector | Determines who will be able to join the order: “All employees”, “Only those included in the project's Teams list”, “Pro is assigned manually by the moderator” |
|  | Welcome text | Text | The message to the Pro that they see before joining the order (optional) |
|  | Pro must be confirmed | Boolean | The moderator must confirm the Pro's joining the order. If disabled, the Pro is considered joined after taking the order into work |
|  | Number of available slots for photographers | Integer | Number of available slots for photographers (if 0, then unavailable for photographers) |
|  | Default photoshoot duration | Integer | Default duration of the photoshoot in minutes (in minutes, so you can set 1.5 hours, like Snappr, 0 \- if not required) |
|  | Number of available slots for videographers | Integer | Number of available slots for videographers (if 0, then unavailable for videographers) |
|  | Default videoshoot duration | Integer | Default duration of the video shoot in minutes (in minutes, so you can set 1.5 hours, like Snappr, 0 \- if not required) |
|  | Show details of the assigned Pro for the client | Boolean | Pass via API / Show the client information about photographers attached to the order |
|  | Min level of Pro | Integer | Minimum Pro level with which one can join the order (optional, this is a future groundwork) |
| **Photo/Video retoucher onboarding** | Welcome text | Text | Message to the retoucher, which they see before joining the order (optional) |
|  | Who has access | Selector | Determines who will have the ability to join the order: "All employees", "Only those on the project's Teams list", "Retoucher is assigned manually by the moderator" |
|  | Guidelines | Guidelines | Guidelines that are shown when joining the order. Contain all guideline settings, the separate Guidelines tab disappears. These same guidelines are used in the Photo/Video shoot blocks |
|  | Need accept guidelines | Boolean | Determines whether the retoucher must necessarily view and accept the guidelines before joining |
|  | Show details of the assigned Retouchers for the client | Boolean | Pass via API / Show the client information about retouchers attached to the order |
|  | Min level of Retoucher | Integer | Minimum Retoucher level with which one can join the order (this is a future groundwork) |
| **Wait payment** | Does not have its own settings | — | Block awaits until payment is completed for the order. A brief description of the block's principles of operation is suggested. |
| **Photo shoot** | Does not have its own settings | — | Block is responsible for tracking photographer statuses, as well as reminders for the Pro and client notifications. A brief description of the block's principles of operation is suggested. |
| **Video shoot** | Does not have its own settings | — | Block is responsible for tracking photographer statuses, as well as reminders for the Pro and client notifications. A brief description of the block's principles of operation is suggested. |
| **Photo Retouching** | Does not have its own settings | — | Block is responsible for tracking retouching time, reminders for the retoucher, and client notifications. A brief description of the block's principles of operation is suggested. |
| **Video Retouching** | Does not have its own settings | — | The block is responsible for tracking video editing time, reminders for the retoucher, and client notifications. It is suggested to output a brief description of the block's operating principles. |
| **Matching** | Does not have its own settings | — | The block waits until the matching of all photos in the order is completed. It is suggested to output a brief description of the block's operating principles. |
| **Send ready order part  to client** | Does not have its own settings | — | The block sends a notification about the completion of a batch of files, through the channels specified in the project's notification settings. It is suggested to output a brief description of the block's operating principles. |
| **File renaming** | Auto Rename mode | Selector | Choice of file renaming type (External ID, Menu item name, ID \+ Item name) |
|  | File names prefix | Text | Prefix for file names (optional) |
|  | File names postfix  | Text | Postfix for file names (optional) |
| **File storage** | Time to life for order files | Integer | Time in days for which files from this order are stored (0 \- if stored indefinitely) |
| **External process** | Does not have its own settings | — | When displaying the settings for this block, we show a description of how to receive a signal from this block in an external system, as well as show a "Test connection" button, which allows checking the correctness of the connection and links to instructions on how to transfer data back and manage order statuses. |
| **Moderation** | Type | Selector | Determines which type of moderation is used (Internal \- if moderation is performed by Splento employees, External \- if moderation is performed by the Splento client) |
|  | Who can access | Selector | If the moderation type is Internal, it is possible to define who has access to moderation (Moderators, Retouchers, Photographers, or multiple roles) |
|  | Maximum number of revisions | Integer | Maximum number of times this block can be executed within one order. If this number of times is exceeded, this step is skipped (if 0 \- this step is called an infinite number of times) |
|  | Block called when files are rejected | Selector | Selection of the block to which files will be sent in case of rejection (files are sent with the "revision" tag) |
| **Send notification** | Title | Text | Text of the alert title that is sent to the client when the block is reached |
|  | Body | Text | Text of the alert body that is sent to the client when the block is reached |
| **If / else** | Does not have its own settings | — | The block causes the timeline to split into branches; currently, it only splits by file type (photo/video). It is proposed to provide a brief description of the block's operating principles. |
| **Merge** | Does not have its own settings | — | The block causes the merging of timeline branches after they have been split using If / Else. It is proposed to provide a brief description of the block's operating principles. |
|  |  |  |  |

