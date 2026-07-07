import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiInstagram, FiMail } from 'react-icons/fi';
import api, { getImageUrl } from '../../services/api';
import './TeamPage.css';

const TeamPage = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const { data } = await api.get('/team');
      setTeam(data.data || []);
    } catch {
      // Data dummy untuk tampilan fallback
      setTeam([
        { id: 1, name: 'Ahmad Rizky', position: 'CEO & Founder', bio: 'Visionary leader with 10+ years in tech industry.', photo: null, linkedin: '#', github: '#' },
        { id: 2, name: 'Sari Dewi', position: 'Lead Developer', bio: 'Full-stack developer passionate about clean code.', photo: null, linkedin: '#', github: '#' },
        { id: 3, name: 'Budi Santoso', position: 'UI/UX Designer', bio: 'Creative designer focused on user-centered design.', photo: null, linkedin: '#', instagram: '#' },
        { id: 4, name: 'Maya Putri', position: 'Project Manager', bio: 'Experienced PM ensuring projects deliver on time.', photo: null, linkedin: '#' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page" aria-busy="true" aria-label="Memuat data tim...">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <main className="team-page">
      {/* Dekorasi latar bintang — tidak memiliki makna konten */}
      <div className="stars-overlay" aria-hidden="true">
        <div id="stars" />
        <div id="stars2" />
        <div id="stars3" />
      </div>

      <div className="container">
        <header className="section-header">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            Tim <span className="gradient-text">Kami</span>
          </motion.h1>
          <motion.p
            className="subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Kenali orang-orang di balik kesuksesan setiap proyek Propscode.
          </motion.p>
        </header>

        {/* ul/li sebagai daftar anggota tim — lebih semantik dari div grid */}
        <ul className="grid grid-4 team-grid" role="list" aria-label="Daftar anggota tim">
          {team.map((member, index) => {
            const photoUrl = getImageUrl(member.photo);

            return (
              <motion.li
                key={member.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <article className="team-card glass-card" aria-label={`Profil ${member.name}`}>
                  <div className="team-photo">
                    {photoUrl ? (
                      <img src={photoUrl} alt={`Foto profil ${member.name}`} />
                    ) : (
                      <div className="team-photo-placeholder" aria-hidden="true">
                        {member.name.charAt(0)}
                      </div>
                    )}

                    {/* Overlay tautan sosial media dengan aria-label yang informatif */}
                    <nav className="team-social-overlay" aria-label={`Sosial media ${member.name}`}>
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`LinkedIn ${member.name}`}
                        >
                          <FiLinkedin aria-hidden="true" />
                        </a>
                      )}
                      {member.github && (
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`GitHub ${member.name}`}
                        >
                          <FiGithub aria-hidden="true" />
                        </a>
                      )}
                      {member.instagram && (
                        <a
                          href={member.instagram}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Instagram ${member.name}`}
                        >
                          <FiInstagram aria-hidden="true" />
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          aria-label={`Email ${member.name}: ${member.email}`}
                        >
                          <FiMail aria-hidden="true" />
                        </a>
                      )}
                    </nav>
                  </div>

                  <div className="team-info">
                    <h2>{member.name}</h2>
                    <p className="team-position gradient-text">{member.position}</p>
                    <p className="team-bio">{member.bio}</p>
                  </div>
                </article>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </main>
  );
};

export default TeamPage;
