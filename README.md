# DJ & Event Staff Management System

A web-based management system to replace text message-based communication between event staff (DJs, photographers, videographers) and operational managers, providing structured logging and reporting capabilities.

## Project Overview

This system addresses the communication chaos that occurs when multiple event staff members (DJs, photographers, videographers) send status updates via group text messages to operational managers. Instead of managing 10+ text conversations, managers get a clean dashboard with structured data and export capabilities.

## Stakeholders

- **Primary Users**: DJs, photographers, videographers
- **Administrative Users**: Operational managers  
- **Client**: Complete DJ and Event Organizer

## Functional Requirements

### Staff User Features
- **Authentication**: Secure login system for event staff
- **Shift Logging**: Digital forms to record:
  - Equipment pickup time
  - Travel start time
  - Event arrival time with photo confirmation
  - Event completion time
  - Return travel time
  - Equipment return time
- **Mobile Responsive**: Optimized for mobile device usage

### Manager Features
- **Dashboard**: Overview of all active and completed shifts
- **Filtering System**: Filter logs by:
  - Staff member
  - Date range
  - Event type
  - Status (in progress, completed)
- **Export Functionality**: Generate Excel reports
- **Real-time Updates**: Live status updates as staff log activities

## Technical Requirements

### System Architecture
- Web-based application
- Mobile-responsive design
- Cloud-hosted database
- Real-time synchronization

### Data Storage
- User profiles and authentication
- Event assignments
- Time logs with timestamps
- Photo uploads
- Audit trail for all activities

## User Stories

### Staff Member
- "As a DJ, I want to quickly log my pickup time so I can start my shift efficiently"
- "As a photographer, I want to upload arrival confirmation photos so my manager knows I'm on-site"

### Operational Manager
- "As a manager, I want to see all staff locations in real-time so I can coordinate effectively"
- "As a manager, I want to export weekly reports so I can track performance and billing"

## Success Criteria
- Eliminate group chat confusion
- Reduce administrative overhead by 70%
- Improve accountability and tracking accuracy
- Enable data-driven operational insights

## Future Enhancements
- GPS tracking integration
- Automated client notifications
- Equipment inventory management
- Performance analytics dashboard

## Getting Started

### Prerequisites
- Node.js (v18+)
- Database (PostgreSQL recommended)
- Cloud storage for photos

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/dj-event-management.git

# Install dependencies
cd dj-event-management
npm install

# Set up environment variables
cp .env.example .env

# Run the application
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Project Link: [https://github.com/yourusername/dj-event-management](https://github.com/yourusername/dj-event-management)