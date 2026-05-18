import React, { useState, useEffect } from "react";
import { 
  FiSearch, FiUsers, FiMail, FiPhone, FiMapPin, 
  FiInfo, FiChevronLeft, FiChevronRight, FiBriefcase,
  FiStar, FiAward, FiGlobe, FiClock, FiFilter, FiX
} from "react-icons/fi";
import "../styles/Contacts.css";

const Contacts = () => {
  const [showNotice, setShowNotice] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 9;

  // Dummy/Example Contact Data - No real information
  const contacts = [
    // Executive Leadership
    { 
      id: 1,
      section: "Executive Leadership", 
      name: "Alex Morgan", 
      position: "Chief Operations Officer", 
      email: "alex.morgan@example.com", 
      phone: "+1 (555) 123-4567",
      extension: "101",
      location: "New York, USA",
      availability: "Mon-Fri 9AM-5PM EST",
      avatar: "AM",
      department: "Executive"
    },
    { 
      id: 2,
      section: "Executive Leadership", 
      name: "Sarah Chen", 
      position: "VP of Engineering", 
      email: "sarah.chen@example.com", 
      phone: "+1 (555) 234-5678",
      extension: "102",
      location: "San Francisco, USA",
      availability: "Mon-Fri 8AM-4PM PST",
      avatar: "SC",
      department: "Executive"
    },
    { 
      id: 3,
      section: "Executive Leadership", 
      name: "Marcus Williams", 
      position: "Chief Technology Officer", 
      email: "marcus.w@example.com", 
      phone: "+1 (555) 345-6789",
      extension: "103",
      location: "Austin, USA",
      availability: "Mon-Fri 9AM-6PM CST",
      avatar: "MW",
      department: "Executive"
    },

    // Customer Support
    { 
      id: 4,
      section: "Customer Support", 
      name: "Emma Rodriguez", 
      position: "Support Team Lead", 
      email: "emma.r@example.com", 
      phone: "+44 (20) 1234-5678",
      extension: "201",
      location: "London, UK",
      availability: "24/7 Rotation",
      avatar: "ER",
      department: "Support"
    },
    { 
      id: 5,
      section: "Customer Support", 
      name: "David Kim", 
      position: "Senior Support Specialist", 
      email: "david.kim@example.com", 
      phone: "+82 (2) 1234-5678",
      extension: "202",
      location: "Seoul, Korea",
      availability: "Mon-Fri 9AM-6PM KST",
      avatar: "DK",
      department: "Support"
    },
    { 
      id: 6,
      section: "Customer Support", 
      name: "Isabella Santos", 
      position: "Technical Support", 
      email: "isabella.s@example.com", 
      phone: "+55 (11) 98765-4321",
      extension: "203",
      location: "São Paulo, Brazil",
      availability: "Mon-Fri 10AM-7PM BRT",
      avatar: "IS",
      department: "Support"
    },

    // Sales & Marketing
    { 
      id: 7,
      section: "Sales & Marketing", 
      name: "James Wilson", 
      position: "Sales Director", 
      email: "james.w@example.com", 
      phone: "+1 (555) 456-7890",
      extension: "301",
      location: "Chicago, USA",
      availability: "Mon-Fri 8AM-5PM CST",
      avatar: "JW",
      department: "Sales"
    },
    { 
      id: 8,
      section: "Sales & Marketing", 
      name: "Nina Patel", 
      position: "Marketing Manager", 
      email: "nina.p@example.com", 
      phone: "+91 (22) 1234-5678",
      extension: "302",
      location: "Mumbai, India",
      availability: "Mon-Fri 10AM-7PM IST",
      avatar: "NP",
      department: "Marketing"
    },
    { 
      id: 9,
      section: "Sales & Marketing", 
      name: "Oliver Schmidt", 
      position: "Regional Sales", 
      email: "oliver.s@example.com", 
      phone: "+49 (30) 1234-5678",
      extension: "303",
      location: "Berlin, Germany",
      availability: "Mon-Fri 9AM-6PM CET",
      avatar: "OS",
      department: "Sales"
    },

    // Engineering & Development
    { 
      id: 10,
      section: "Engineering & Development", 
      name: "Luna Zhang", 
      position: "Lead Developer", 
      email: "luna.z@example.com", 
      phone: "+86 (10) 1234-5678",
      extension: "401",
      location: "Beijing, China",
      availability: "Mon-Fri 9AM-6PM CST",
      avatar: "LZ",
      department: "Engineering"
    },
    { 
      id: 11,
      section: "Engineering & Development", 
      name: "Carlos Mendez", 
      position: "Software Architect", 
      email: "carlos.m@example.com", 
      phone: "+52 (55) 1234-5678",
      extension: "402",
      location: "Mexico City, Mexico",
      availability: "Mon-Fri 10AM-7PM CST",
      avatar: "CM",
      department: "Engineering"
    },
    { 
      id: 12,
      section: "Engineering & Development", 
      name: "Priya Sharma", 
      position: "QA Lead", 
      email: "priya.s@example.com", 
      phone: "+1 (555) 567-8901",
      extension: "403",
      location: "Seattle, USA",
      availability: "Mon-Fri 8AM-4PM PST",
      avatar: "PS",
      department: "Engineering"
    },

    // Human Resources
    { 
      id: 13,
      section: "Human Resources", 
      name: "Jennifer Lee", 
      position: "HR Director", 
      email: "jennifer.l@example.com", 
      phone: "+1 (555) 678-9012",
      extension: "501",
      location: "Boston, USA",
      availability: "Mon-Fri 9AM-5PM EST",
      avatar: "JL",
      department: "HR"
    },
    { 
      id: 14,
      section: "Human Resources", 
      name: "Michael Brown", 
      position: "Recruitment Specialist", 
      email: "michael.b@example.com", 
      phone: "+44 (20) 9876-5432",
      extension: "502",
      location: "Manchester, UK",
      availability: "Mon-Fri 9AM-5PM GMT",
      avatar: "MB",
      department: "HR"
    },
    { 
      id: 15,
      section: "Human Resources", 
      name: "Sofia Rossi", 
      position: "Employee Relations", 
      email: "sofia.r@example.com", 
      phone: "+39 (06) 1234-5678",
      extension: "503",
      location: "Rome, Italy",
      availability: "Mon-Fri 9AM-6PM CET",
      avatar: "SR",
      department: "HR"
    },

    // IT & Infrastructure
    { 
      id: 16,
      section: "IT & Infrastructure", 
      name: "Thomas Anderson", 
      position: "IT Director", 
      email: "thomas.a@example.com", 
      phone: "+1 (555) 789-0123",
      extension: "601",
      location: "Dallas, USA",
      availability: "24/7 On Call",
      avatar: "TA",
      department: "IT"
    },
    { 
      id: 17,
      section: "IT & Infrastructure", 
      name: "Nadia Hassan", 
      position: "Network Administrator", 
      email: "nadia.h@example.com", 
      phone: "+971 (4) 1234-5678",
      extension: "602",
      location: "Dubai, UAE",
      availability: "Sun-Thu 9AM-6PM GST",
      avatar: "NH",
      department: "IT"
    },
    { 
      id: 18,
      section: "IT & Infrastructure", 
      name: "Viktor Petrov", 
      position: "Security Analyst", 
      email: "viktor.p@example.com", 
      phone: "+7 (495) 123-4567",
      extension: "603",
      location: "Moscow, Russia",
      availability: "Mon-Fri 9AM-6PM MSK",
      avatar: "VP",
      department: "IT"
    },

    // Finance & Accounting
    { 
      id: 19,
      section: "Finance & Accounting", 
      name: "Rachel Green", 
      position: "CFO", 
      email: "rachel.g@example.com", 
      phone: "+1 (555) 890-1234",
      extension: "701",
      location: "New York, USA",
      availability: "Mon-Fri 9AM-5PM EST",
      avatar: "RG",
      department: "Finance"
    },
    { 
      id: 20,
      section: "Finance & Accounting", 
      name: "Kenji Tanaka", 
      position: "Financial Analyst", 
      email: "kenji.t@example.com", 
      phone: "+81 (3) 1234-5678",
      extension: "702",
      location: "Tokyo, Japan",
      availability: "Mon-Fri 9AM-6PM JST",
      avatar: "KT",
      department: "Finance"
    },
    { 
      id: 21,
      section: "Finance & Accounting", 
      name: "Maria Garcia", 
      position: "Accounts Payable", 
      email: "maria.g@example.com", 
      phone: "+34 (91) 1234-5678",
      extension: "703",
      location: "Madrid, Spain",
      availability: "Mon-Fri 9AM-5PM CET",
      avatar: "MG",
      department: "Finance"
    }
  ];

  // Get unique departments for filter
  const departments = ["All", ...new Set(contacts.map(c => c.section))];

  // Filter contacts based on search & department
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "All" ? true : contact.section === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);

  // Reset page on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment]);

  const getDepartmentIcon = (section) => {
    const icons = {
      "Executive Leadership": <FiStar />,
      "Customer Support": <FiUsers />,
      "Sales & Marketing": <FiBriefcase />,
      "Engineering & Development": <FiAward />,
      "Human Resources": <FiUsers />,
      "IT & Infrastructure": <FiGlobe />,
      "Finance & Accounting": <FiBriefcase />
    };
    return icons[section] || <FiUsers />;
  };

  return (
    <div className="contacts-container">
      {/* Hero Section */}
      <div className="contacts-hero">
        <div className="hero-content">
          <h1>Company Directory</h1>
          <p>Connect with our global team of professionals</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{contacts.length}</span>
              <span className="stat-label">Team Members</span>
            </div>
            <div className="stat">
              <span className="stat-number">{new Set(contacts.map(c => c.section)).size}</span>
              <span className="stat-label">Departments</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Information Notice */}
      {showNotice && (
        <div className="info-notice">
          <div className="notice-icon">
            <FiInfo />
          </div>
          <div className="notice-content">
            <h4>About This Directory</h4>
            <p>This is a <strong>demonstration directory</strong> containing example contacts for presentation purposes. All information shown is fictional and used solely to demonstrate the interface functionality. In production, this would display real employee contact information.</p>
          </div>
          <button className="notice-close" onClick={() => setShowNotice(false)}>
            <FiX />
          </button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, position, department or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-wrapper">
          <FiFilter className="filter-icon" />
          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        <p>Showing {filteredContacts.length} of {contacts.length} team members</p>
      </div>

      {/* Contacts Grid - Card Layout */}
      {currentContacts.length > 0 ? (
        <div className="contacts-grid">
          {currentContacts.map((contact) => (
            <div key={contact.id} className="contact-card">
              <div className="card-header">
                <div className="avatar">
                  {contact.avatar}
                </div>
                <div className="dept-badge">
                  {getDepartmentIcon(contact.section)}
                  <span>{contact.section}</span>
                </div>
              </div>
              
              <div className="card-body">
                <h3 className="contact-name">{contact.name}</h3>
                <p className="contact-position">{contact.position}</p>
                
                <div className="contact-details">
                  <div className="detail-item">
                    <FiMail />
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </div>
                  <div className="detail-item">
                    <FiPhone />
                    <span>{contact.phone}</span>
                    {contact.extension !== "N/A" && <span className="ext">Ext: {contact.extension}</span>}
                  </div>
                  <div className="detail-item">
                    <FiMapPin />
                    <span>{contact.location}</span>
                  </div>
                  <div className="detail-item">
                    <FiClock />
                    <span>{contact.availability}</span>
                  </div>
                </div>
              </div>
              
              <div className="card-footer">
                <a href={`mailto:${contact.email}`} className="contact-btn email-btn">
                  <FiMail /> Send Email
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <FiUsers size={48} />
          <h3>No matching contacts found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            <FiChevronLeft /> Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default Contacts;