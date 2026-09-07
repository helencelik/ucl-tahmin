import { supabase, isSupabaseConfigured } from './supabase';
import { Match, Prediction, LeaderboardUser } from '../types';

// ==========================================
// DEMO / YEDEK VERİLER (Supabase bağlanana kadar)
// ==========================================
const DEMO_MATCHES: Match[] = [
  {
    "id": "c0002026-0000-0000-0001-000000000001",
    "home_team": "AEK Athens",
    "away_team": "LASK Linz",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8563.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8254.png",
    "match_date": "2026-09-08T19:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "OPAP Arena"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000002",
    "home_team": "Club Brugge",
    "away_team": "Aston Villa",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8342.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10252.png",
    "match_date": "2026-09-08T19:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "Jan Breydel Stadium"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000003",
    "home_team": "Borussia Dortmund",
    "away_team": "Villarreal",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9789.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10205.png",
    "match_date": "2026-09-08T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "Signal Iduna Park"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000004",
    "home_team": "FC Porto",
    "away_team": "Manchester City",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9773.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8456.png",
    "match_date": "2026-09-08T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "Estádio do Dragão"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000005",
    "home_team": "Lille",
    "away_team": "Real Betis",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8639.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8603.png",
    "match_date": "2026-09-08T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "Decathlon Arena – Stade Pierre-Mauroy"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000006",
    "home_team": "Real Madrid",
    "away_team": "Inter",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8633.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8636.png",
    "match_date": "2026-09-08T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "Santiago Bernabéu"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000007",
    "home_team": "Barcelona",
    "away_team": "Feyenoord",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8634.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10235.png",
    "match_date": "2026-09-09T19:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "Spotify Camp Nou"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000008",
    "home_team": "Stuttgart",
    "away_team": "Viking",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10269.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8414.png",
    "match_date": "2026-09-09T19:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "MHPArena"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000009",
    "home_team": "Liverpool",
    "away_team": "Atlético Madrid",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8650.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9906.png",
    "match_date": "2026-09-09T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "Anfield"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000010",
    "home_team": "Paris Saint-Germain",
    "away_team": "Slovan Bratislava",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8575.png",
    "match_date": "2026-09-09T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "Parc des Princes"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000011",
    "home_team": "Sporting CP",
    "away_team": "Galatasaray",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8637.png",
    "match_date": "2026-09-09T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "Estádio José Alvalade"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000012",
    "home_team": "Napoli",
    "away_team": "Arsenal",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9875.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9825.png",
    "match_date": "2026-09-09T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "Stadio Diego Armando Maradona"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000013",
    "home_team": "Fenerbahçe",
    "away_team": "Roma",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8695.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8686.png",
    "match_date": "2026-09-10T19:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "Ülker Stadyumu"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000014",
    "home_team": "PSV",
    "away_team": "Shakhtar Donetsk",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8640.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10145.png",
    "match_date": "2026-09-10T19:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "Philips Stadion"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000015",
    "home_team": "Como",
    "away_team": "RB Leipzig",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8534.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/178475.png",
    "match_date": "2026-09-10T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "Stadio Giuseppe Sinigaglia"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000016",
    "home_team": "Bayern Munich",
    "away_team": "Bodø/Glimt",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8411.png",
    "match_date": "2026-09-10T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "Allianz Arena"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000017",
    "home_team": "Manchester United",
    "away_team": "Sabah",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10260.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/937076.png",
    "match_date": "2026-09-10T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "Old Trafford"
  },
  {
    "id": "c0002026-0000-0000-0001-000000000018",
    "home_team": "Slavia Prague",
    "away_team": "Lens",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8497.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8586.png",
    "match_date": "2026-09-10T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 1,
    "stadium": "Fortuna Arena"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000001",
    "home_team": "Lens",
    "away_team": "Sporting CP",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8586.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",
    "match_date": "2026-10-13T19:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "Stade Bollaert-Delelis"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000002",
    "home_team": "Sabah",
    "away_team": "Slavia Prague",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/937076.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8497.png",
    "match_date": "2026-10-13T19:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "Bank Respublika Arena"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000003",
    "home_team": "Arsenal",
    "away_team": "Lille",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9825.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8639.png",
    "match_date": "2026-10-13T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "Emirates Stadium"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000004",
    "home_team": "Atlético Madrid",
    "away_team": "Manchester United",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9906.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10260.png",
    "match_date": "2026-10-13T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "Riyadh Air Metropolitano"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000005",
    "home_team": "Inter",
    "away_team": "Club Brugge",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8636.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8342.png",
    "match_date": "2026-10-13T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "San Siro"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000006",
    "home_team": "Galatasaray",
    "away_team": "Barcelona",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8637.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8634.png",
    "match_date": "2026-10-13T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "RAMS Park"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000007",
    "home_team": "RB Leipzig",
    "away_team": "PSV",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/178475.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8640.png",
    "match_date": "2026-10-13T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "Red Bull Arena"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000008",
    "home_team": "Viking",
    "away_team": "Bayern Munich",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8414.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png",
    "match_date": "2026-10-13T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "SR-Bank Arena"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000009",
    "home_team": "Villarreal",
    "away_team": "Napoli",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10205.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9875.png",
    "match_date": "2026-10-13T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "Estadio de la Cerámica"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000010",
    "home_team": "Feyenoord",
    "away_team": "Como",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10235.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8534.png",
    "match_date": "2026-10-14T19:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "De Kuip"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000011",
    "home_team": "LASK Linz",
    "away_team": "Liverpool",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8254.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8650.png",
    "match_date": "2026-10-14T19:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "Raiffeisen Arena"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000012",
    "home_team": "Roma",
    "away_team": "Real Madrid",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8686.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8633.png",
    "match_date": "2026-10-14T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "Stadio Olimpico"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000013",
    "home_team": "Aston Villa",
    "away_team": "Fenerbahçe",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10252.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8695.png",
    "match_date": "2026-10-14T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "Villa Park"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000014",
    "home_team": "Shakhtar Donetsk",
    "away_team": "AEK Athens",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10145.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8563.png",
    "match_date": "2026-10-14T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "Arena Lviv"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000015",
    "home_team": "Bodø/Glimt",
    "away_team": "Borussia Dortmund",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8411.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9789.png",
    "match_date": "2026-10-14T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "Aspmyra Stadion"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000016",
    "home_team": "Manchester City",
    "away_team": "Paris Saint-Germain",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8456.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png",
    "match_date": "2026-10-14T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "Etihad Stadium"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000017",
    "home_team": "Real Betis",
    "away_team": "FC Porto",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8603.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9773.png",
    "match_date": "2026-10-14T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "Estadio La Cartuja"
  },
  {
    "id": "c0002026-0000-0000-0002-000000000018",
    "home_team": "Slovan Bratislava",
    "away_team": "Stuttgart",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8575.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10269.png",
    "match_date": "2026-10-14T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 2,
    "stadium": "Tehelné pole"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000001",
    "home_team": "Fenerbahçe",
    "away_team": "Slavia Prague",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8695.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8497.png",
    "match_date": "2026-10-20T19:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "Ülker Stadyumu"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000002",
    "home_team": "Sabah",
    "away_team": "Borussia Dortmund",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/937076.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9789.png",
    "match_date": "2026-10-20T19:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "Bank Respublika Arena"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000003",
    "home_team": "Roma",
    "away_team": "Slovan Bratislava",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8686.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8575.png",
    "match_date": "2026-10-20T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "Stadio Olimpico"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000004",
    "home_team": "FC Porto",
    "away_team": "PSV",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9773.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8640.png",
    "match_date": "2026-10-20T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "Estádio do Dragão"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000005",
    "home_team": "Liverpool",
    "away_team": "Villarreal",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8650.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10205.png",
    "match_date": "2026-10-20T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "Anfield"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000006",
    "home_team": "Manchester City",
    "away_team": "AEK Athens",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8456.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8563.png",
    "match_date": "2026-10-20T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "Etihad Stadium"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000007",
    "home_team": "Paris Saint-Germain",
    "away_team": "Barcelona",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8634.png",
    "match_date": "2026-10-20T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "Parc des Princes"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000008",
    "home_team": "Napoli",
    "away_team": "Bodø/Glimt",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9875.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8411.png",
    "match_date": "2026-10-20T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "Stadio Diego Armando Maradona"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000009",
    "home_team": "Stuttgart",
    "away_team": "Atlético Madrid",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10269.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9906.png",
    "match_date": "2026-10-20T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "MHPArena"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000010",
    "home_team": "Como",
    "away_team": "Manchester United",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8534.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10260.png",
    "match_date": "2026-10-21T19:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "Stadio Giuseppe Sinigaglia"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000011",
    "home_team": "Lille",
    "away_team": "Galatasaray",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8639.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8637.png",
    "match_date": "2026-10-21T19:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "Decathlon Arena – Stade Pierre-Mauroy"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000012",
    "home_team": "Aston Villa",
    "away_team": "Viking",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10252.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8414.png",
    "match_date": "2026-10-21T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "Villa Park"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000013",
    "home_team": "Club Brugge",
    "away_team": "Lens",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8342.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8586.png",
    "match_date": "2026-10-21T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "Jan Breydel Stadium"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000014",
    "home_team": "Bayern Munich",
    "away_team": "Arsenal",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9825.png",
    "match_date": "2026-10-21T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "Allianz Arena"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000015",
    "home_team": "Inter",
    "away_team": "Shakhtar Donetsk",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8636.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10145.png",
    "match_date": "2026-10-21T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "San Siro"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000016",
    "home_team": "Real Madrid",
    "away_team": "RB Leipzig",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8633.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/178475.png",
    "match_date": "2026-10-21T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "Santiago Bernabéu"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000017",
    "home_team": "Real Betis",
    "away_team": "Feyenoord",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8603.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10235.png",
    "match_date": "2026-10-21T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "Estadio La Cartuja"
  },
  {
    "id": "c0002026-0000-0000-0003-000000000018",
    "home_team": "Sporting CP",
    "away_team": "LASK Linz",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8254.png",
    "match_date": "2026-10-21T22:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 3,
    "stadium": "Estádio José Alvalade"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000001",
    "home_team": "Shakhtar Donetsk",
    "away_team": "Sporting CP",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10145.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",
    "match_date": "2026-11-03T20:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "Arena Lviv"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000002",
    "home_team": "Galatasaray",
    "away_team": "Stuttgart",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8637.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10269.png",
    "match_date": "2026-11-03T20:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "RAMS Park"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000003",
    "home_team": "Atlético Madrid",
    "away_team": "Bayern Munich",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9906.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png",
    "match_date": "2026-11-03T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "Riyadh Air Metropolitano"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000004",
    "home_team": "Barcelona",
    "away_team": "Aston Villa",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8634.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10252.png",
    "match_date": "2026-11-03T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "Spotify Camp Nou"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000005",
    "home_team": "Feyenoord",
    "away_team": "Inter",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10235.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8636.png",
    "match_date": "2026-11-03T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "De Kuip"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000006",
    "home_team": "Bodø/Glimt",
    "away_team": "Lille",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8411.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8639.png",
    "match_date": "2026-11-03T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "Aspmyra Stadion"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000007",
    "home_team": "LASK Linz",
    "away_team": "Slovan Bratislava",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8254.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8575.png",
    "match_date": "2026-11-03T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "Raiffeisen Arena"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000008",
    "home_team": "Manchester United",
    "away_team": "Roma",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10260.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8686.png",
    "match_date": "2026-11-03T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "Old Trafford"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000009",
    "home_team": "Villarreal",
    "away_team": "Paris Saint-Germain",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10205.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png",
    "match_date": "2026-11-03T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "Estadio de la Cerámica"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000010",
    "home_team": "AEK Athens",
    "away_team": "Real Madrid",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8563.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8633.png",
    "match_date": "2026-11-04T20:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "OPAP Arena"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000011",
    "home_team": "Fenerbahçe",
    "away_team": "Liverpool",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8695.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8650.png",
    "match_date": "2026-11-04T20:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "Ülker Stadyumu"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000012",
    "home_team": "Borussia Dortmund",
    "away_team": "Real Betis",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9789.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8603.png",
    "match_date": "2026-11-04T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "Signal Iduna Park"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000013",
    "home_team": "FC Porto",
    "away_team": "Napoli",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9773.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9875.png",
    "match_date": "2026-11-04T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "Estádio do Dragão"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000014",
    "home_team": "PSV",
    "away_team": "Club Brugge",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8640.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8342.png",
    "match_date": "2026-11-04T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "Philips Stadion"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000015",
    "home_team": "RB Leipzig",
    "away_team": "Manchester City",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/178475.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8456.png",
    "match_date": "2026-11-04T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "Red Bull Arena"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000016",
    "home_team": "Lens",
    "away_team": "Como",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8586.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8534.png",
    "match_date": "2026-11-04T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "Stade Bollaert-Delelis"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000017",
    "home_team": "Slavia Prague",
    "away_team": "Arsenal",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8497.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9825.png",
    "match_date": "2026-11-04T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "Fortuna Arena"
  },
  {
    "id": "c0002026-0000-0000-0004-000000000018",
    "home_team": "Viking",
    "away_team": "Sabah",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8414.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/937076.png",
    "match_date": "2026-11-04T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 4,
    "stadium": "SR-Bank Arena"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000001",
    "home_team": "Bodø/Glimt",
    "away_team": "LASK Linz",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8411.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8254.png",
    "match_date": "2026-11-24T20:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "Aspmyra Stadion"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000002",
    "home_team": "Galatasaray",
    "away_team": "Aston Villa",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8637.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10252.png",
    "match_date": "2026-11-24T20:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "RAMS Park"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000003",
    "home_team": "Arsenal",
    "away_team": "Borussia Dortmund",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9825.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9789.png",
    "match_date": "2026-11-24T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "Emirates Stadium"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000004",
    "home_team": "Como",
    "away_team": "AEK Athens",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8534.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8563.png",
    "match_date": "2026-11-24T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "Stadio Giuseppe Sinigaglia"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000005",
    "home_team": "Feyenoord",
    "away_team": "FC Porto",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10235.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9773.png",
    "match_date": "2026-11-24T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "De Kuip"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000006",
    "home_team": "Manchester City",
    "away_team": "Napoli",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8456.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9875.png",
    "match_date": "2026-11-24T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "Etihad Stadium"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000007",
    "home_team": "RB Leipzig",
    "away_team": "Lens",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/178475.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8586.png",
    "match_date": "2026-11-24T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "Red Bull Arena"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000008",
    "home_team": "Real Madrid",
    "away_team": "PSV",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8633.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8640.png",
    "match_date": "2026-11-24T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "Santiago Bernabéu"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000009",
    "home_team": "Slovan Bratislava",
    "away_team": "Real Betis",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8575.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8603.png",
    "match_date": "2026-11-24T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "Tehelné pole"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000010",
    "home_team": "Sabah",
    "away_team": "Barcelona",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/937076.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8634.png",
    "match_date": "2026-11-25T20:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "Bank Respublika Arena"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000011",
    "home_team": "Slavia Prague",
    "away_team": "Villarreal",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8497.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10205.png",
    "match_date": "2026-11-25T20:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "Fortuna Arena"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000012",
    "home_team": "Atlético Madrid",
    "away_team": "Viking",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9906.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8414.png",
    "match_date": "2026-11-25T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "Riyadh Air Metropolitano"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000013",
    "home_team": "Club Brugge",
    "away_team": "Liverpool",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8342.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8650.png",
    "match_date": "2026-11-25T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "Jan Breydel Stadium"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000014",
    "home_team": "Inter",
    "away_team": "Stuttgart",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8636.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10269.png",
    "match_date": "2026-11-25T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "San Siro"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000015",
    "home_team": "Shakhtar Donetsk",
    "away_team": "Fenerbahçe",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10145.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8695.png",
    "match_date": "2026-11-25T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "Arena Lviv"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000016",
    "home_team": "Lille",
    "away_team": "Bayern Munich",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8639.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png",
    "match_date": "2026-11-25T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "Decathlon Arena – Stade Pierre-Mauroy"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000017",
    "home_team": "Paris Saint-Germain",
    "away_team": "Roma",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8686.png",
    "match_date": "2026-11-25T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "Parc des Princes"
  },
  {
    "id": "c0002026-0000-0000-0005-000000000018",
    "home_team": "Sporting CP",
    "away_team": "Manchester United",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10260.png",
    "match_date": "2026-11-25T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 5,
    "stadium": "Estádio José Alvalade"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000001",
    "home_team": "Viking",
    "away_team": "Feyenoord",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8414.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10235.png",
    "match_date": "2026-12-08T20:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "SR-Bank Arena"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000002",
    "home_team": "Villarreal",
    "away_team": "Sabah",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10205.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/937076.png",
    "match_date": "2026-12-08T20:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "Estadio de la Cerámica"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000003",
    "home_team": "AEK Athens",
    "away_team": "Galatasaray",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8563.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8637.png",
    "match_date": "2026-12-08T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "OPAP Arena"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000004",
    "home_team": "Roma",
    "away_team": "Sporting CP",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8686.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",
    "match_date": "2026-12-08T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "Stadio Olimpico"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000005",
    "home_team": "Aston Villa",
    "away_team": "Paris Saint-Germain",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10252.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png",
    "match_date": "2026-12-08T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "Villa Park"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000006",
    "home_team": "Barcelona",
    "away_team": "Manchester City",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8634.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8456.png",
    "match_date": "2026-12-08T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "Spotify Camp Nou"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000007",
    "home_team": "Bayern Munich",
    "away_team": "Slavia Prague",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8497.png",
    "match_date": "2026-12-08T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "Allianz Arena"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000008",
    "home_team": "Manchester United",
    "away_team": "RB Leipzig",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10260.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/178475.png",
    "match_date": "2026-12-08T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "Old Trafford"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000009",
    "home_team": "Napoli",
    "away_team": "Club Brugge",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9875.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8342.png",
    "match_date": "2026-12-08T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "Stadio Diego Armando Maradona"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000010",
    "home_team": "Real Betis",
    "away_team": "Como",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8603.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8534.png",
    "match_date": "2026-12-09T20:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "Estadio La Cartuja"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000011",
    "home_team": "Slovan Bratislava",
    "away_team": "Shakhtar Donetsk",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8575.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10145.png",
    "match_date": "2026-12-09T20:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "Tehelné pole"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000012",
    "home_team": "Arsenal",
    "away_team": "Real Madrid",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9825.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8633.png",
    "match_date": "2026-12-09T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "Emirates Stadium"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000013",
    "home_team": "Borussia Dortmund",
    "away_team": "Inter",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9789.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8636.png",
    "match_date": "2026-12-09T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "Signal Iduna Park"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000014",
    "home_team": "LASK Linz",
    "away_team": "Fenerbahçe",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8254.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8695.png",
    "match_date": "2026-12-09T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "Raiffeisen Arena"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000015",
    "home_team": "Liverpool",
    "away_team": "FC Porto",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8650.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9773.png",
    "match_date": "2026-12-09T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "Anfield"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000016",
    "home_team": "PSV",
    "away_team": "Atlético Madrid",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8640.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9906.png",
    "match_date": "2026-12-09T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "Philips Stadion"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000017",
    "home_team": "Lens",
    "away_team": "Bodø/Glimt",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8586.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8411.png",
    "match_date": "2026-12-09T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "Stade Bollaert-Delelis"
  },
  {
    "id": "c0002026-0000-0000-0006-000000000018",
    "home_team": "Stuttgart",
    "away_team": "Lille",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10269.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8639.png",
    "match_date": "2026-12-09T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 6,
    "stadium": "MHPArena"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000001",
    "home_team": "Bodø/Glimt",
    "away_team": "Atlético Madrid",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8411.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9906.png",
    "match_date": "2027-01-19T20:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "Aspmyra Stadion"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000002",
    "home_team": "Galatasaray",
    "away_team": "Feyenoord",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8637.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10235.png",
    "match_date": "2027-01-19T20:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "RAMS Park"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000003",
    "home_team": "AEK Athens",
    "away_team": "Roma",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8563.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8686.png",
    "match_date": "2027-01-19T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "OPAP Arena"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000004",
    "home_team": "Aston Villa",
    "away_team": "Borussia Dortmund",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10252.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9789.png",
    "match_date": "2027-01-19T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "Villa Park"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000005",
    "home_team": "Inter",
    "away_team": "Liverpool",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8636.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8650.png",
    "match_date": "2027-01-19T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "San Siro"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000006",
    "home_team": "FC Porto",
    "away_team": "Slavia Prague",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9773.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8497.png",
    "match_date": "2027-01-19T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "Estádio do Dragão"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000007",
    "home_team": "Lille",
    "away_team": "Slovan Bratislava",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8639.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8575.png",
    "match_date": "2027-01-19T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "Decathlon Arena – Stade Pierre-Mauroy"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000008",
    "home_team": "Real Madrid",
    "away_team": "LASK Linz",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8633.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8254.png",
    "match_date": "2027-01-19T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "Santiago Bernabéu"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000009",
    "home_team": "Stuttgart",
    "away_team": "Club Brugge",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10269.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8342.png",
    "match_date": "2027-01-19T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "MHPArena"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000010",
    "home_team": "Fenerbahçe",
    "away_team": "Villarreal",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8695.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10205.png",
    "match_date": "2027-01-20T20:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "Ülker Stadyumu"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000011",
    "home_team": "Sabah",
    "away_team": "Napoli",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/937076.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9875.png",
    "match_date": "2027-01-20T20:45:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "Bank Respublika Arena"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000012",
    "home_team": "Como",
    "away_team": "Paris Saint-Germain",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8534.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png",
    "match_date": "2027-01-20T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "Stadio Giuseppe Sinigaglia"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000013",
    "home_team": "Manchester United",
    "away_team": "Bayern Munich",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10260.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png",
    "match_date": "2027-01-20T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "Old Trafford"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000014",
    "home_team": "RB Leipzig",
    "away_team": "Shakhtar Donetsk",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/178475.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10145.png",
    "match_date": "2027-01-20T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "Red Bull Arena"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000015",
    "home_team": "Lens",
    "away_team": "Manchester City",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8586.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8456.png",
    "match_date": "2027-01-20T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "Stade Bollaert-Delelis"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000016",
    "home_team": "Real Betis",
    "away_team": "Arsenal",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8603.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9825.png",
    "match_date": "2027-01-20T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "Estadio La Cartuja"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000017",
    "home_team": "Sporting CP",
    "away_team": "Barcelona",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8634.png",
    "match_date": "2027-01-20T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "Estádio José Alvalade"
  },
  {
    "id": "c0002026-0000-0000-0007-000000000018",
    "home_team": "Viking",
    "away_team": "PSV",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8414.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8640.png",
    "match_date": "2027-01-20T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 7,
    "stadium": "SR-Bank Arena"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000001",
    "home_team": "Arsenal",
    "away_team": "Sabah",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9825.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/937076.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Emirates Stadium"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000002",
    "home_team": "Roma",
    "away_team": "Lille",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8686.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8639.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Stadio Olimpico"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000003",
    "home_team": "Atlético Madrid",
    "away_team": "Fenerbahçe",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9906.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8695.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Riyadh Air Metropolitano"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000004",
    "home_team": "Borussia Dortmund",
    "away_team": "AEK Athens",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9789.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8563.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Signal Iduna Park"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000005",
    "home_team": "Club Brugge",
    "away_team": "Bodø/Glimt",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8342.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8411.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Jan Breydel Stadium"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000006",
    "home_team": "Bayern Munich",
    "away_team": "Real Betis",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8603.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Allianz Arena"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000007",
    "home_team": "Barcelona",
    "away_team": "Como",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8634.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8534.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Spotify Camp Nou"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000008",
    "home_team": "Shakhtar Donetsk",
    "away_team": "Real Madrid",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10145.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8633.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Arena Lviv"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000009",
    "home_team": "Feyenoord",
    "away_team": "RB Leipzig",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10235.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/178475.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "De Kuip"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000010",
    "home_team": "LASK Linz",
    "away_team": "FC Porto",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8254.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9773.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Raiffeisen Arena"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000011",
    "home_team": "Liverpool",
    "away_team": "Lens",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8650.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8586.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Anfield"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000012",
    "home_team": "Manchester City",
    "away_team": "Sporting CP",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8456.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Etihad Stadium"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000013",
    "home_team": "Paris Saint-Germain",
    "away_team": "Galatasaray",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8637.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Parc des Princes"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000014",
    "home_team": "PSV",
    "away_team": "Stuttgart",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8640.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10269.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Philips Stadion"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000015",
    "home_team": "Slavia Prague",
    "away_team": "Aston Villa",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8497.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10252.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Fortuna Arena"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000016",
    "home_team": "Napoli",
    "away_team": "Viking",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/9875.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8414.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Stadio Diego Armando Maradona"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000017",
    "home_team": "Villarreal",
    "away_team": "Manchester United",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10205.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/10260.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Estadio de la Cerámica"
  },
  {
    "id": "c0002026-0000-0000-0008-000000000018",
    "home_team": "Slovan Bratislava",
    "away_team": "Inter",
    "home_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8575.png",
    "away_team_logo": "https://images.fotmob.com/image_resources/logo/teamlogo/8636.png",
    "match_date": "2027-01-27T23:00:00+03:00",
    "status": "pending",
    "real_home_score": null,
    "real_away_score": null,
    "stage": "league",
    "matchweek": 8,
    "stadium": "Tehelné pole"
  }
];

const DEMO_LEADERBOARD: LeaderboardUser[] = [];

// LocalStorage anahtarları (Demo modunda çalışabilmek için)
const LS_PREDICTIONS_KEY = 'ucl_demo_predictions';
const LS_MATCHES_KEY = 'ucl_demo_matches';

// Hafta belirleme yardımcısı (Eğer veritabanında matchweek sütunu henüz doldurulmamışsa)
function inferMatchweek(dateStr: string): number {
  if (!dateStr) return 1;
  const d = dateStr.slice(0, 10);
  if (d <= '2026-09-15') return 1;
  if (d <= '2026-10-15') return 2;
  if (d <= '2026-10-25') return 3;
  if (d <= '2026-11-10') return 4;
  if (d <= '2026-11-30') return 5;
  if (d <= '2026-12-15') return 6;
  if (d <= '2027-01-22') return 7;
  return 8;
}

// ==========================================
// MAÇ İŞLEMLERİ (MATCHES)
// ==========================================
export async function getMatches(): Promise<Match[]> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem(LS_MATCHES_KEY);
    let list = DEMO_MATCHES;
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch {
        list = DEMO_MATCHES;
      }
    }
    return list.map((m) => ({
      ...m,
      stage: m.stage || 'league',
      matchweek: m.matchweek || inferMatchweek(m.match_date)
    }));
  }

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true });

  if (error) {
    console.error('Maçlar alınırken hata:', error);
    // Hata durumunda DEMO_MATCHES'a güvenli geri dönüş
    return DEMO_MATCHES;
  }

  // Veritabanı boş ise DEMO_MATCHES (144 maç) dön
  if (!data || data.length === 0) {
    return DEMO_MATCHES;
  }

  const stadiumMap = new Map<string, string>();
  DEMO_MATCHES.forEach((d) => {
    if (d.stadium) {
      stadiumMap.set(d.id, d.stadium);
      stadiumMap.set(`${d.home_team}-${d.away_team}`, d.stadium);
    }
  });

  return data.map((m) => ({
    ...m,
    stage: m.stage || 'league',
    matchweek: m.matchweek || inferMatchweek(m.match_date),
    stadium: m.stadium || stadiumMap.get(m.id) || stadiumMap.get(`${m.home_team}-${m.away_team}`) || (m.home_team === 'Galatasaray' ? 'RAMS Park' : '')
  }));
}

// ==========================================
// TAHMİN İŞLEMLERİ (PREDICTIONS)
// ==========================================
export async function getUserPredictions(userId: string): Promise<Record<string, Prediction>> {
  // 1. Yerel depolamadaki tahminleri al (anında erişim)
  const saved = localStorage.getItem(LS_PREDICTIONS_KEY);
  let localMap: Record<string, Prediction> = {};
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      localMap = parsed[userId] || {};
    } catch {
      localMap = {};
    }
  }

  if (!isSupabaseConfigured()) {
    return localMap;
  }

  // 2. Supabase'den çekmeyi dene
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.warn('[getUserPredictions] Supabase sorgu uyarısı, yerel veriler kullanılıyor:', error.message);
      return localMap;
    }

    const predictionMap: Record<string, Prediction> = { ...localMap };
    (data || []).forEach((pred) => {
      predictionMap[pred.match_id] = pred;
    });

    // Yerel depolamayı senkronize et
    const all = saved ? JSON.parse(saved) : {};
    all[userId] = predictionMap;
    localStorage.setItem(LS_PREDICTIONS_KEY, JSON.stringify(all));

    return predictionMap;
  } catch (err) {
    console.warn('[getUserPredictions] Ağ/bağlantı hatası, yerel veriler kullanılıyor:', err);
    return localMap;
  }
}

export async function saveUserPrediction(
  userId: string,
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<Prediction> {
  // 1. ÖNCELİKLE YEREL DEPOLAMAYA KAYDET (Kayıp ve çökme riskini sıfıra indirir)
  const saved = localStorage.getItem(LS_PREDICTIONS_KEY);
  let all: Record<string, Record<string, Prediction>> = {};
  try {
    all = saved ? JSON.parse(saved) : {};
  } catch {
    all = {};
  }
  if (!all[userId]) all[userId] = {};

  const existing = all[userId][matchId];
  const localPred: Prediction = {
    id: existing?.id || 'pred-' + Date.now(),
    user_id: userId,
    match_id: matchId,
    predicted_home_score: homeScore,
    predicted_away_score: awayScore,
    points_earned: existing?.points_earned || 0,
    updated_at: new Date().toISOString()
  };
  all[userId][matchId] = localPred;
  localStorage.setItem(LS_PREDICTIONS_KEY, JSON.stringify(all));

  // Eğer Supabase yapılandırılmamışsa doğrudan yerel tahmini dön
  if (!isSupabaseConfigured()) {
    return localPred;
  }

  // 2. SUPABASE UPSERT (Hata oluşsa dahi yerel kopya hazır olduğundan hata fırlatmaz)
  try {
    const { data, error } = await supabase
      .from('predictions')
      .upsert(
        {
          user_id: userId,
          match_id: matchId,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id,match_id'
        }
      )
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[saveUserPrediction] Supabase kayıt uyarısı (yerel depolama başarıyla kaydedildi):', error.message);
      return localPred;
    }

    if (data) {
      all[userId][matchId] = data;
      localStorage.setItem(LS_PREDICTIONS_KEY, JSON.stringify(all));
      return data;
    }
  } catch (err: any) {
    console.warn('[saveUserPrediction] Ağ/Veritabanı hatası (yerel depolama devrede):', err?.message);
  }

  return localPred;
}

// Biten maçın diğer kullanıcı tahminlerini görüntüleme (Şeffaflık)
export async function getMatchPredictions(matchId: string): Promise<Prediction[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('predictions')
    .select('*, user:users(id, name, username, display_name, total_points)')
    .eq('match_id', matchId);

  if (error) {
    console.error('Maç tahminleri alınırken hata:', error);
    return [];
  }

  return data || [];
}

const LS_LEADERBOARD_KEY = 'ucl_demo_leaderboard';

// ==========================================
// LİDERLİK TABLOSU (LEADERBOARD)
// ==========================================
export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  // Eski sahte demo önbelleğini derhal temizle
  try {
    localStorage.removeItem(LS_LEADERBOARD_KEY);
  } catch {}

  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    // Sadece Supabase public.users tablosundaki gerçek kullanıcıları çek
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('total_points', { ascending: false });

    if (error) {
      console.error('Liderlik tablosu Supabase sorgu hatası:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Kullanıcıların tahmin istatistiklerini çekme
    const { data: allPreds } = await supabase
      .from('predictions')
      .select('user_id, points_earned');

    const exactCountMap: Record<string, number> = {};
    const diffCountMap: Record<string, number> = {};
    const resultCountMap: Record<string, number> = {};
    const totalCountMap: Record<string, number> = {};

    (allPreds || []).forEach((item) => {
      totalCountMap[item.user_id] = (totalCountMap[item.user_id] || 0) + 1;
      if (item.points_earned === 4) exactCountMap[item.user_id] = (exactCountMap[item.user_id] || 0) + 1;
      else if (item.points_earned === 3) diffCountMap[item.user_id] = (diffCountMap[item.user_id] || 0) + 1;
      else if (item.points_earned === 2) resultCountMap[item.user_id] = (resultCountMap[item.user_id] || 0) + 1;
    });

    const mappedUsers: LeaderboardUser[] = data.map((user) => {
      const exact = exactCountMap[user.id] || 0;
      const diff = diffCountMap[user.id] || 0;
      const result = resultCountMap[user.id] || 0;
      const totalPreds = totalCountMap[user.id] || 0;

      const rawName = user.name || user.display_name || 'Katılımcı';
      const cleanUsername = user.username || (user.email ? user.email.split('@')[0] : rawName.toLowerCase().replace(/[^a-z0-9]/g, ''));

      return {
        id: user.id,
        name: rawName,
        display_name: rawName,
        username: cleanUsername,
        email: user.email,
        role: user.role || 'user',
        total_points: user.total_points || 0,
        exact_scores_count: exact,
        diff_scores_count: diff,
        result_scores_count: result,
        predictions_count: totalPreds,
        created_at: user.created_at || ''
      };
    });

    // Puan yüksekten düşüğe, eşitlikte tam skor sayısına göre sırala
    mappedUsers.sort((a, b) => {
      if (b.total_points !== a.total_points) {
        return b.total_points - a.total_points;
      }
      return (b.exact_scores_count || 0) - (a.exact_scores_count || 0);
    });

    return mappedUsers.map((u, idx) => ({
      ...u,
      rank: idx + 1
    }));
  } catch (err) {
    console.error('Liderlik tablosu çekilemedi:', err);
    return [];
  }
}

/**
 * 4 - 3 - 2 - 0 Puanlama Kuralı (Sıralı Öncelik Mantığı):
 * 1. ÖNCELİK: Tam Skor (Exact Match) -> 4 PUAN
 * 2. ÖNCELİK: Skor / Gol Farkı İsabeti (Goal Difference Match) -> 3 PUAN
 * 3. ÖNCELİK: Maçın Kazananı / Beraberlik (Outcome Match) -> 2 PUAN
 * 4. ÖNCELİK: Yanlış Tahmin -> 0 PUAN
 */
export function calculatePredictionPoints(
  predHome: number,
  predAway: number,
  realHome: number,
  realAway: number
): number {
  // 1. ÖNCELİK: Tam Skor Bildimi (Exact Match)
  if (predHome === realHome && predAway === realAway) {
    return 4;
  }

  // 2. ÖNCELİK: Skor / Gol Farkı İsabeti (Goal Difference Match)
  const predDiff = predHome - predAway;
  const realDiff = realHome - realAway;
  if (predDiff === realDiff) {
    return 3;
  }

  // 3. ÖNCELİK: Maçın Kazananı veya Beraberlik Durumu (Outcome Match)
  if (Math.sign(predDiff) === Math.sign(realDiff)) {
    return 2;
  }

  // 4. Yanlış Tahmin
  return 0;
}

// ==========================================
// YÖNETİCİ İŞLEMLERİ (ADMIN)
// ==========================================
export async function updateMatchResult(
  matchId: string,
  realHomeScore: number,
  realAwayScore: number
): Promise<void> {
  if (!matchId || typeof matchId !== 'string' || matchId.trim() === '') {
    throw new Error('Geçersiz maç ID: Güncellenecek maçın kimlik bilgisi (id) eksik.');
  }

  const cleanMatchId = matchId.trim();

  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem(LS_MATCHES_KEY);
    const matches: Match[] = saved ? JSON.parse(saved) : [...DEMO_MATCHES];
    const matchIndex = matches.findIndex((m) => m.id === cleanMatchId);
    if (matchIndex !== -1) {
      matches[matchIndex] = {
        ...matches[matchIndex],
        real_home_score: realHomeScore,
        real_away_score: realAwayScore,
        status: 'finished'
      };
      localStorage.setItem(LS_MATCHES_KEY, JSON.stringify(matches));

      // Demo modunda puanları otomatik hesapla (4 - 3 - 2 - 0 Kuralı)
      const savedPreds = localStorage.getItem(LS_PREDICTIONS_KEY);
      const userTotalPointsMap: Record<string, number> = {};
      const userExactCountMap: Record<string, number> = {};

      if (savedPreds) {
        const allPreds = JSON.parse(savedPreds);
        Object.keys(allPreds).forEach((uid) => {
          let userSum = 0;
          let userExacts = 0;
          Object.keys(allPreds[uid]).forEach((mId) => {
            const p = allPreds[uid][mId];
            if (mId === cleanMatchId) {
              const pts = calculatePredictionPoints(
                p.predicted_home_score,
                p.predicted_away_score,
                realHomeScore,
                realAwayScore
              );
              p.points_earned = pts;
            }
            userSum += (p.points_earned || 0);
            if (p.points_earned === 4) userExacts++;
          });
          userTotalPointsMap[uid] = userSum;
          userExactCountMap[uid] = userExacts;
        });
        localStorage.setItem(LS_PREDICTIONS_KEY, JSON.stringify(allPreds));

        // Liderlik tablosunu güncelle
        const savedLd = localStorage.getItem(LS_LEADERBOARD_KEY);
        const currentLd: LeaderboardUser[] = savedLd ? JSON.parse(savedLd) : [...DEMO_LEADERBOARD];
        const updatedLd = currentLd.map((u) => ({
          ...u,
          total_points: userTotalPointsMap[u.id] !== undefined ? userTotalPointsMap[u.id] : u.total_points,
          exact_scores_count: userExactCountMap[u.id] !== undefined ? userExactCountMap[u.id] : u.exact_scores_count
        })).sort((a, b) => b.total_points - a.total_points).map((u, i) => ({ ...u, rank: i + 1 }));

        localStorage.setItem(LS_LEADERBOARD_KEY, JSON.stringify(updatedLd));
      }
    }
    return;
  }

  // Supabase matches tablosunu güncelle (WHERE id = cleanMatchId)
  const { error } = await supabase
    .from('matches')
    .update({
      real_home_score: realHomeScore,
      real_away_score: realAwayScore,
      status: 'finished'
    })
    .eq('id', cleanMatchId);

  if (error) {
    console.error('Maç skoru güncellenirken hata:', error);
    throw error;
  }

  // Supabase üzerinde otomatik istemci puan hesaplama güvencesi (Trigger olmasa bile puanları garanti hesaplar)
  try {
    const { data: preds } = await supabase
      .from('predictions')
      .select('id, user_id, predicted_home_score, predicted_away_score')
      .eq('match_id', cleanMatchId);

    if (preds && preds.length > 0) {
      for (const p of preds) {
        const pts = calculatePredictionPoints(
          p.predicted_home_score,
          p.predicted_away_score,
          realHomeScore,
          realAwayScore
        );
        await supabase
          .from('predictions')
          .update({ points_earned: pts })
          .eq('id', p.id);
      }

      // Kullanıcıların toplam puanlarını hesapla ve users tablosunda güncelle
      const affectedUserIds = [...new Set(preds.map((p) => p.user_id))];
      for (const uid of affectedUserIds) {
        const { data: userPreds } = await supabase
          .from('predictions')
          .select('points_earned')
          .eq('user_id', uid);

        const total = (userPreds || []).reduce((sum, item) => sum + (item.points_earned || 0), 0);
        await supabase
          .from('users')
          .update({ total_points: total })
          .eq('id', uid);
      }
    }
  } catch (syncErr) {
    console.warn('[updateMatchResult] Puan hesaplama güvence bloğu uyarısı:', syncErr);
  }
}

export async function createMatch(matchData: {
  home_team: string;
  away_team: string;
  home_team_logo?: string;
  away_team_logo?: string;
  match_date: string;
  stage?: string;
  matchweek?: number;
  stadium?: string;
}): Promise<Match> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem(LS_MATCHES_KEY);
    const matches: Match[] = saved ? JSON.parse(saved) : [...DEMO_MATCHES];
    const newMatch: Match = {
      id: 'demo-match-' + Date.now(),
      ...matchData,
      status: 'pending',
      real_home_score: null,
      real_away_score: null
    };
    matches.push(newMatch);
    localStorage.setItem(LS_MATCHES_KEY, JSON.stringify(matches));
    return newMatch;
  }

  const { data, error } = await supabase
    .from('matches')
    .insert([
      {
        ...matchData,
        status: 'pending'
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Maç eklenirken hata:', error);
    throw error;
  }

  return data;
}

export async function deleteMatch(matchId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem(LS_MATCHES_KEY);
    const matches: Match[] = saved ? JSON.parse(saved) : [...DEMO_MATCHES];
    const filtered = matches.filter((m) => m.id !== matchId);
    localStorage.setItem(LS_MATCHES_KEY, JSON.stringify(filtered));
    return;
  }

  const { error } = await supabase.from('matches').delete().eq('id', matchId);
  if (error) {
    console.error('Maç silinirken hata:', error);
    throw error;
  }
}
