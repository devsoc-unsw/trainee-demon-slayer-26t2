
# AUTH
- /auth
  - /signup - MIA
  - /login - MIA
  - /logout - MIA
  - /delete - ARSHIA
  - /reset-password - ARSHIA

# CALENDAR
- /calendar
  - /events
  - /create-event
  - /delete-event/{id}
  - /edit-event/{id}

# ANALYTICS
- /analytics
total for each stage of applications (applied, received response, accepted, rejected) (application funnel)
  - /applied
  - /oa
  - /interviews
    - /behavioural
    - /technical
  - /offers
  - /declined
  - /rejections
total number of companies applied to
- different roles applied to
  - /roles
total number of type of companies applied to
  - /company-types
response time for each company: time between date applied and first response received
  - /response-time/{id}
number of applications on a specified day (create a github type heat map on frontend)
  - /applications-by-day