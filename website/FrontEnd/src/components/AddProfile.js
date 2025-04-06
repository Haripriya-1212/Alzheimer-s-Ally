import React, { useState, useEffect } from 'react';
import { AiFillDelete } from 'react-icons/ai';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BiSearchAlt2 } from 'react-icons/bi';
import axios from 'axios';
import BeatLoader from 'react-spinners/BeatLoader';
import Aos from 'aos';
import Navbar from './Navbar'; // Assuming Navbar is available
import 'aos/dist/aos.css';
import './styles/Home.css';

const AddProfile = () => {
  const [profiles, setProfiles] = useState([]); // Profiles list
  const [name, setName] = useState(''); // Name input
  const [relation, setRelation] = useState(''); // Relation input
  const [link, setLink] = useState(''); // Link input
  const [searchQuery, setSearchQuery] = useState(''); // Search input
  const [loading, setLoading] = useState(false); // Loader state

  // Initialize AOS for animations
  useEffect(() => {
    Aos.init({ duration: 1000 });
  }, []);

  // Add a new profile
  const handleAddProfile = async (e) => {
    e.preventDefault();

    // Ensure all fields are filled
    if (!name || !relation || !link) {
      toast.error('Please fill all fields.');
      return;
    }

    // Ensure the link is an absolute URL
    const formattedLink = link.startsWith('http') ? link : `https://${link}`;

    const profileData = {
      name,
      relation,
      link: formattedLink,
    };

    try {
      setLoading(true); // Show loader
      const response = await axios.post('http://localhost:8080/api/profile/add', profileData, {
        headers: { 'Content-Type': 'application/json' },
      });
      setProfiles([...profiles, response.data.profile]);
      toast.success('Profile added successfully');
      setName('');
      setRelation('');
      setLink('');
    } catch (err) {
      console.error('Error adding profile:', err);
      toast.error('Failed to add profile. Please try again.');
    } finally {
      setLoading(false); // Hide loader
    }
  };

  // Filter profiles based on search query
  const filteredProfiles = profiles.filter((profile) =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <>
      {loading ? (
        <BeatLoader color="#39A7FF" loading={loading} size={50} aria-label="Loading Spinner" />
      ) : (
        <div className="main-home-container" data-aos="zoom-out">
          <Navbar />
          <div className="main-form" data-aos="zoom-in">
            <div className="search-bar">
              <h1>Profiles</h1>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="search"
                placeholder="Search profiles"
              />
              <button id="search-bt">
                <BiSearchAlt2 size={22} />
              </button>
            </div>
            <form onSubmit={handleAddProfile} className="form-row">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                className="todo-ip"
                placeholder="Enter name"
              />
              <input
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                type="text"
                className="todo-ip"
                placeholder="Enter relation"
              />
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                type="text"
                className="todo-ip"
                placeholder="Enter link"
              />
              <button id="add-todo">ADD Profile</button>
            </form>
            <div className="item-list" data-aos="zoom-out">
              <ul>
                {profiles.length === 0 && <h3 id="no-todo">No Profiles</h3>}
                {filteredProfiles.map((profile, index) => (
                  <li key={index}>
                    <label htmlFor="" className="item-name">
                      {profile.name} - {profile.relation} -{' '}
                      <a
                        href={profile.link}
                        className="profile-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {profile.link}
                      </a>
                    </label>
                    <button
                      id="del-bt"
                      onClick={() => setProfiles(profiles.filter((p) => p !== profile))}
                    >
                      <AiFillDelete size={20} color="#FF6969" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProfile;
