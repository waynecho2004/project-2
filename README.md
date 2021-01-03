# Wayne's Address Book

  An online dashboard to view and manage your contacts and favorite links.  This is built with express, with Mongo as its database, Github as source control, Heroku as deployment platform.  Click the [link](https://wcho-project2.herokuapp.com) to access

## Project Links

* [Github](https://github.com/waynecho2004/project-2)
* [Deployment](https://wcho-project2.herokuapp.com)

## Technologies
* Node.js
* Express (7 restful routes)
* Express EJS Layouut (or Partials)
* Bcrypt, Sessions & Environment Variables (dotenv)
* Boostrap 4
* Datatable
* Mongo and Mongoose: database (Embedded & Referenced data model)
* Github: source control
* Heroku: deployment

## Wireframes and Design
[Wideframes and Data Model](https://drive.google.com/file/d/1uA2XlA6qw9415nY2JYHKJAgTgwIrOeiH/view?usp=sharing)

### Design Concepts
* Model View Controller Design
* Mobile First Design
* Mongoose Embedded data model (Contact and Child) and Referenced data model (Organization and Contact)

## User Stories and Features

#### Contact:
* User can add, view, edit and delete a Contact
* User can add, edit, or delete a Child to/from a Contact (using Embedded data model)

#### Organization:
* User can add, view, edit, and delete a Organization
* User can add mulitiple Contacts to a Organization (using Referenced data model)
* User can remove multiple Contacts from a Organization (using Referenced data model)

#### Authentication:
* User can signup to create an Account
* User can login to view Contact and Organization
* User can only see Signup and login links without authentication
* User can see Contacts and Organizations links page once authenticated

#### Authorization:
* User with view access can view Contacts and Organizations
* User with admin access can view, add, edit, and delete Contacts and Organizations

#### Mobile View:
* User can see the minimized Contacts table with name, phone, edit, and Delete columns
* User can see the minimized Organizations table with name, edit, and Delete columns

#### Extra Features:
* User can search and sort Contacts

## Future Development / Enhancement
* Display (error) message on the page
* Display a confirmation page before user delete a record
* Logout user if the page is inactive for five minutes
* Filter Organization and Contact based on the group user belonging to
* A Welcome page with NJ map (using Google Maps) displaying the locations of NJ contacts
* Add sidebar with newsletter update from each organization