---
company: Scales Nature Park
dateRange: May 2022 - September 2022
role: Full Stack Application Developer
image: /images/scalesLogo.png
---

In my summer of 2022 co-op work term placement, I worked with Scales Nature Park to **implement a better data entry system for wildlife conservation purposes** and **develop a set of automation tools used for data management on google sheets.**

Getting into this position, I've had minimal JavaScript experience developing an [SVG Image Viewer](https://svg-image-viewer.herokuapp.com/) website as a part of a school project at the University of Guelph. To achieve my work tasks, I had to develop effective strategies to learn new software concepts, tools, and frameworks. 

## Data Entry System Project
I led a small team of 2 developers in the development of a data entry system for wildlife conservation data collection as the main project during my employment. The system consists of a mobile data entry application where: 
- Users can enter observation data of reptiles and amphibians spotted in the wild during field surveys. 
- Users can save data entries to their device while offline and edit them and/or submit them for database storage later when they get an internet connection.  
- Users can share saved or uploaded data entries with other users.
- Users can search for uploaded data entries using specific criteria.
- Users can export submitted data entries in CSV format to a google drive folder.

and a windows admin application where:
- Users can update mobile app user credentials, delete accounts and give or revoke permissions from users to use certain features on the app like searching or submitting data to the database.
- Users can update and delete the data entry fields that are displayed in the data entry form on the mobile app.
- Users can update and delete submitted data entries to the database.
- Users can export all submitted data entries in CSV format to a google drive folder.

The project was written in the MongoDB, Express.js, React Native, Node.js (MERN) stack. My team and I used:
- A Mongo database to store user credentials, data entry fields, submitted and shared data entries. 
- Express.js server callbacks in a Node.js environment to process user data and query the database.
- React Native and React Native Windows UI frameworks to develop the user interfaces for the mobile data entry application and the admin windows application.
- Google Drive API to export data entries and their associated images to a google drive folder utilizing a dedicated google service account.

An overview of the system design:
![ProjectChart](/images/projectchart.jpg)

This project is open-source, [click here](https://github.com/Scales-Nature-Park/start-native-app) to view.

## Google Sheets Automation
I participated in a set of google sheets automation scripts using both the Google Sheets API and the dedicated Google Apps Script development environment. Some of the projects I've worked on include:
- A Node.js-based discord application that allows users to request time off from a discord text channel which then updates a dedicated google sheet. 
- A synchronizing script that moves a row from one sheet to another when a certain condition value is met in one of the cells in that row. 


## My Experience
Working at Scales Nature Park helped me gain valuable experiences that aligned with my learning goals prior to my employment. 

By managing the data entry system project repository and actively contributing to it, I have improved my source-control and project management skills by maintaining repository projects, and issues and branching out of main for codebase updates.

While working on the data entry system, I joined the field technicians in surveys and worked with them closely to gather ideas and requirements for features that needed to be in the applications. I also gained a lot of knowledge about the reptiles and amphibians that we surveyed. This aided me in achieving better app design and software tests.  
