import React, { useState, useEffect } from "react";
import "../styles/Contacts.css";

const Contacts = () => {
   const contacts = [
    // QMS & SMS
    { section: "QMS & SMS", name: "Robel Bekele", position: "Mgr.", email: "RobelB@ethiopianairlines.com", ext: "4631" },
    { section: "QMS & SMS", name: "Henok Shegena", position: "Mgr.", email: "HENOKSH@ethiopianairlines.com", ext: "8045" },
    { section: "QMS & SMS", name: "Yohanes Fetene", position: "QMS", email: "YohannesFet@ethiopianairlines.com", ext: "4639" },
    { section: "QMS & SMS", name: "Bereket Melaku", position: "SMS", email: "BereketMu@ethiopianairlines.com", ext: "8622" },
    { section: "QMS & SMS", name: "Dure Hirpha", position: "SMS", email: "DureH@ethiopianairlines.com", ext: "8794" },
    { section: "QMS & SMS", name: "Hussien Seid", position: "SMS II", email: "HussienS@ethiopianairlines.com", ext: "8083" },
    { section: "QMS & SMS", name: "Nadew K.", position: "QMS", email: "NadewKs@ethiopianairlines.com", ext: "4639" },
    { section: "QMS & SMS", name: "Kalkidan W/gegn", position: "Admin", email: "KalkidanW@ethiopianairlines.com", ext: "8694" },

    // Chief Pilots
    { section: "Chief Pilots", name: "Capt Nathan Elias", position: "B737", email: "NATHANE@ethiopianairlines.com", ext: "4590" },
    { section: "Chief Pilots", name: "Capt Mulualem H.", position: "Q400", email: "MulualemHb@ethiopianairlines.com", ext: "4120" },
    { section: "Chief Pilots", name: "Capt Yoftahe A.", position: "B777/87", email: "YOFTAHEAD@ethiopianairlines.com", ext: "4119" },
    { section: "Chief Pilots", name: "Capt Anteneh T.", position: "A350", email: "ANTENEHTE@ethiopianairlines.com", ext: "8137" },

    // Outstation
    { section: "Outstation", name: "Bezawit Mengesha", position: "Mgr.", email: "BezawitMe@ethiopianairlines.com", ext: "4725" },
    { section: "Outstation", name: "Bezawit Wondimu", position: "TL", email: "BezawitW@ethiopianairlines.com", ext: "8825" },
    { section: "Outstation", name: "Fatuma Hussen", position: "QMS/SMS", email: "FatumaH@ethiopianairlines.com", ext: "8826" },
    { section: "Outstation", name: "Michael Habtamu", position: "SMS exp.", email: "Michaelh@ethiopianairlines.com", ext: "8825" },

    // Flight Dispatch
    { section: "Flight Dispatch", name: "Yosef Wabbe", position: "Mgr.", email: "YosefwA@ethiopianairlines.com", ext: "8653" },
    { section: "Flight Dispatch", name: "Rebira Juki", position: "TL", email: "RebiraJi@ethiopianairlines.com", ext: "7160/4852" },
    { section: "Flight Dispatch", name: "Abudin Oumer", position: "Disp. Off.", email: "Abudino@ethiopianairlines.com", ext: "4852" },
    { section: "Flight Dispatch", name: "Yinges Getachew", position: "Disp. Off.", email: "YingesG@ethiopianairlines.com", ext: "4852/8803" },

    // Crew Scheduling
    { section: "Crew Scheduling", name: "Christian Belay", position: "Mgr.", email: "ChristianB@ethiopianairlines.com", ext: "8232" },
    { section: "Crew Scheduling", name: "Geda Ansha", position: "CR Off.", email: "GedaNS@ethiopianairlines.com", ext: "4798" },
    { section: "Crew Scheduling", name: "Eskedar Bekele", position: "CR Off.", email: "EskedarB@ethiopianairlines.com", ext: "8891" },

    // Catering
    { section: "Catering", name: "Eleni Wondimu", position: "Mgr.", email: "EleniW@ethiopianairlines.com", ext: "4302" },
    { section: "Catering", name: "Samiya Jihad", position: "SMS Off.", email: "SamiyaJ@ethiopianairlines.com", ext: "-" },

    // MCC
    { section: "MCC", name: "Selamawit Assefa", position: "TL", email: "SelamawitAs@ethiopianairlines.com", ext: "4113" },
    { section: "MCC", name: "Etsehiwot Awraris", position: "Eng. III", email: "EtsehiwotA@ethiopianairlines.com", ext: "4103" },

    // EAU
    { section: "EAU", name: "Mikias Eshetu", position: "Mgr.", email: "MikiasE@ethiopianairlines.com", ext: "8430" },
    { section: "EAU", name: "Zekarias Tireso", position: "Tr. Cord.", email: "ZekariasT@ethiopianairlines.com", ext: "4057" },

    // Domestic Airport R/A
    { section: "Domestic Airport R/A", name: "Zeleke Mena", position: "TL", email: "ZelekeM@ethiopianairlines.com", ext: "090405212" },
    { section: "Domestic Airport R/A", name: "Ephrem Abubeker", position: "SMS", email: "EphremAbu@ethiopianairlines.com", ext: "7294" },
    { section: "Domestic Airport R/A", name: "Habtamu Tasew", position: "SMS", email: "HabitamuT@ethiopianairlines.com", ext: "7175" },
    { section: "Domestic Airport R/A", name: "Enibel Sebhat", position: "SMS", email: "EnibelS@ethiopianairlines.com", ext: "7670" },

    // ADD Airport
    { section: "ADD Airport", name: "Kassahun Sineshaw", position: "Mgr.", email: "kassahunsn@ethiopianairlines.com", ext: "4045" },
    { section: "ADD Airport", name: "Solomon G/tsadik", position: "TL", email: "SolomonGs@ethiopianairlines.com", ext: "7638/4344" },

    // CLC R/A
    { section: "CLC R/A", name: "Amehayesus H.", position: "Mgr.", email: "AmehayesusH@ethiopianairlines.com", ext: "3630" },
    { section: "CLC R/A", name: "Ermias D.", position: "-", email: "ERMIYASD@ethiopianairlines.com", ext: "8337" },

    // Ground Handling
    { section: "Ground Handling", name: "Alebachew Akalu", position: "Mgr.", email: "AlebachewA@ethiopianairlines.com", ext: "4399" },
    { section: "Ground Handling", name: "Bahru Alemayehu", position: "TL", email: "BahruAl@ethiopianairlines.com", ext: "4671/4402" },
    { section: "Ground Handling", name: "Abenezer Kelb.", position: "-", email: "AbenezerDa@ethiopianairlines.com", ext: "4671/4402" },

    // Cargo R/A
    { section: "Cargo R/A", name: "Mulualem Wossen", position: "Mgr.", email: "MulualemW@ethiopianairlines.com", ext: "4073" },
    { section: "Cargo R/A", name: "Dessalew Adinew", position: "SMS", email: "DessalewA@ethiopianairlines.com", ext: "4074" }
  ];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 10;

  // Unique sections for dropdown
  const sections = ["All", ...new Set(contacts.map(c => c.section))];

  // Filter contacts based on search & section
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = Object.values(contact).some(val =>
      val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesSection = selectedSection === "All" ? true : contact.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  // Pagination calculations based on filtered contacts
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);

  // Reset to first page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSection]);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="contacts-container">
      <h1>SLA Contact Information Directory</h1>

      <div className="filter-bar">
        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
          {sections.map((section, index) => (
            <option key={index} value={section}>{section}</option>
          ))}
        </select>
      </div>

      <table className="contacts-table">
        <thead>
          <tr>
            <th>Section</th>
            <th>Name</th>
            <th>Position</th>
            <th>Email</th>
            <th>Extension</th>
          </tr>
        </thead>
        <tbody>
          {currentContacts.length > 0 ? (
            currentContacts.map((contact, index) => (
              <tr key={index}>
                <td>{contact.section}</td>
                <td>{contact.name}</td>
                <td>{contact.position}</td>
                <td><a href={`mailto:${contact.email}`}>{contact.email}</a></td>
                <td>{contact.ext}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", color: "#888", fontStyle: "italic" }}>
                No contacts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}

<div className="pagination">
  <button onClick={() => setCurrentPage(prev => prev === 1 ? totalPages : prev - 1)}>
    Previous
  </button>

  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
    <button
      key={page}
      className={currentPage === page ? "active-page" : ""}
      onClick={() => setCurrentPage(page)}
    >
      {page}
    </button>
  ))}

  <button onClick={() => setCurrentPage(prev => prev === totalPages ? 1 : prev + 1)}>
    Next
  </button>
</div>

    </div>
  );
};

export default Contacts;
