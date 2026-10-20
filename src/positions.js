// ==================================================
// BIBLIOTHÈQUE DE POSITIONS — TdB
// ==================================================
//
// Ce fichier est le seul à modifier pour alimenter le menu « bibliothèque »
// (bouton en forme de dossier, au-dessus du champ FEN).
//
// Chaque position est un objet :
//
//    path  = chemin dans le menu, du plus général au plus précis.
//            Le premier élément doit être l'une des 7 catégories ci-dessous ;
//            les suivants (autant que vous voulez) sont des sous-catégories
//            créées automatiquement la première fois qu'elles apparaissent.
//
//            Dans un nom (de sous-catégorie ou de position), tout groupe de lettres
//            placé entre accolades est remplacé par des figurines :
//               lettres françaises : R Roi, D Dame, T Tour, F Fou, C Cavalier, P Pion
//               MAJUSCULE = figurine blanche, minuscule = figurine noire
//
//               '{P}-Tour en 7ème'      →  [Pion blanc]-Tour en 7ème
//               '{p}-Tour en 7ème'      →  [Pion noir]-Tour en 7ème
//               '{RTP} vs {rt}'         →  Roi, Tour, Pion blancs  vs  Roi, Tour noirs
//               '{P}-{t} en 7ème'       →  [Pion blanc]-[Tour noire] en 7ème
//
//            Raccourci : 'fig: RTP vs RT' équivaut à '{RTP} vs {rt}'.
//
//    title = nom affiché dans le menu (et dans l'en-tête [Event] du PGN)
//
//    fen   = position de départ. Le trait est celui indiqué par le FEN : la
//            partie démarre aussitôt avec le bouton Trait correspondant
//            sélectionné (cliquer dessus ramène à l'édition, l'autre bouton
//            change le trait).
//
//    note  = (facultatif) texte d'info affiché au survol dans le menu
//
// Exemple :
//
//    {
//        path: ['Finales de Tours', 'fig: RTP vs RT', 'Pion-Tour', 'Pion en 7ème rangée'],
//        title: 'Position de Lucena',
//        fen: '1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1'
//    },
//
// Dans chaque menu, les sous-catégories et les positions apparaissent dans
// l'ordre où elles sont écrites ci-dessous : il suffit donc de déplacer un
// bloc pour changer son rang. Un chemin ou un FEN invalide est signalé dans
// la console du navigateur (F12) et la position est ignorée.
// ==================================================

// Les catégories (et leur ordre d'affichage)
export const categories = [
    'TdB Chronologique',
    'TdB Thématique'
];

export const positions = [

    // ---------- TdB chronologique ----------
    
    // ---------- 2024-2025 ----------
    // ---------- TdB1 ----------

    {
        path: ['TdB Chronologique', 'TdB1', 'Mat du Couloir'],
        title: 'TdB1-1 : Fuster - Balogh (Budapest, 1945)',
        fen: '5rk1/5ppp/8/8/8/4PQ2/r1q2PPP/RR4K1 b - - 0 1'
    },

    {
        path: ['TdB Chronologique', 'TdB1', 'Mat du Couloir'],
        title: 'TdB1-2 : Rovner - Kamishov (Moscou, 1947)',
        fen: '1r1r2k1/2q2ppp/p3b3/4p3/1p2P3/5B2/PPPR1QPP/3R3K w - - 0 1'
    },

    {
        path: ['TdB Chronologique', 'TdB1', 'Mat du Couloir'],
        title: 'TdB1-3 : Teschner - Portisch (Monte Carlo, 1969)',
        fen: 'k1r1r3/pp5p/1q6/3R1Np1/1b6/1P3P2/2Q1R1PP/7K b - - 0 1'
    },

    {
        path: ['TdB Chronologique', 'TdB1', 'Finales {R}{D} vs {r}{d} - Le Rectangle 4x3'],
        title: 'TdB1-4 : J. de la Villa (Los 100 Finales que hay que saber, 2008)',
        fen: '8/6P1/8/8/5K2/8/6k1/7q w - - 0 1'
    },

    {
        path: ['TdB Chronologique', 'TdB1', 'Finales {R}{D} vs {r}{d} - Le Rectangle 4x3'],
        title: 'TdB1-5 : Anand - Thipsay (Coimbatore, 1987)',
        fen: '2Q5/8/8/8/8/3K4/1k6/q7 w - - 0 1'
    },

    {
        path: ['TdB Chronologique', 'TdB1', 'Etude - L\'Escalier de Mouterde'],
        title: 'TdB1-6 : A. Mouterde (La Stratégie, 1922)',
        fen: '3kr2q/6Q1/8/8/8/4R3/8/K7 w - - 0 1'
    },

    // ---------- TdB2 ----------

    {
        path: ['TdB Chronologique', 'TdB2', 'Mat de Boden'],
        title: 'TdB2-1 : Ed. Lasker - Englund (Scheveningue 1913)',
        fen: '2kr1b1r/pp3ppp/2p1b2q/4B3/4Q3/2PB2R1/PPP2PPP/3R2K1 w - - 0 1'
    },

    {
        path: ['TdB Chronologique', 'TdB2', 'Mat de Boden'],
        title: 'TdB2-2 : Morphy - Thompson (New York, 1859)',
        fen: 'r2k1r2/pp1b2pp/1b2Pn2/2p5/Q1B2Bq1/2P5/P5PP/3R1RK1 w - - 0 1'
    },

    {
        path: ['TdB Chronologique', 'TdB2', 'Mat de Boden'],
        title: 'TdB2-3 : Schulder - Boden (Londres, 1860)',
        fen: '2k1rb1r/ppp3pp/2np1q2/5b2/2B2P2/2P1BQ2/PP1N1P1P/2KR3R b - - 0 1'
    },

    {
        path: ['TdB Chronologique', 'TdB2', 'Finales {R}{C} vs {r}{p} - {p}-Tour'],
        title: 'TdB2-4 : J. de La Villa (Los 100 Finales que hay que saber, 2008)',
        fen: '7K/8/8/8/7N/7p/7k/8 w - - 0 1'
    },

    {
        path: ['TdB Chronologique', 'TdB2', 'Finales {R}{C} vs {r}{p} - {p}-Tour'],
        title: 'TdB2-5 : J. Levitt (1997)',
        fen: '7K/8/8/8/7N/7p/8/7k w - - 0 1'
    },

    {
        path: ['TdB Chronologique', 'TdB2', 'Etude - L\'Echelle de Saavedra'],
        title: 'TdB2-6 : F. Saavedra / G.E. Barbier (Glasgow Weekly Citizen, 1895)',
        fen: '8/8/1KP5/3r4/8/8/8/k7 w - - 0 1'
    },

    // ---------- TdB3 ----------

    {
        path: ['TdB Chronologique', 'TdB3', 'Mat d\'Anastasia'],
        title: 'TdB3-1 : Bayer - Falkbeer (Vienne, 1852)',
        fen: 'Q7/p1p1k1pp/1b6/7q/3n1r2/8/P4PPP/RN3RK1 b - - 0 1'
    },

    {
        path: ['TdB Chronologique', 'TdB3', 'Mat d\'Anastasia'],
        title: 'TdB3-2 : Kamyshov - Sokolski (Leningrad, 1936)',
        fen: '6k1/p4p1p/3p1p2/2p1r3/2PnrqN1/P6P/1P1Q1PP1/3R1RK1 b - - 0 1'
    },

    {
        path: ['TdB Chronologique', 'TdB3', 'Mat d\'Anastasia'],
        title: 'TdB3-3 : Vidmar - Euwe (Karlsbad, 1929)',
        fen: '6k1/5pb1/1p1N3p/p5p1/5q2/Q6P/PPr5/3RR1K1 w - - 0 1'
    },

    {
        path: ['TdB Chronologique', 'TdB3', 'Finales {R}{P} vs {r} - Cases Clés d\'un {P} passé'],
        title: 'TdB3-4 : J. Drtina (Casopis Ceskych Sachistu, 1908)',
        fen: '5k2/8/8/8/8/2P5/8/3K4 w - - 0 1'
    },

    {
        path: ['TdB Chronologique', 'TdB3', 'Finales {R}{P} vs {r} - Cases Clés d\'un {P} passé'],
        title: 'TdB3-5 : d\'après Drtina',
        fen: '4k3/8/8/8/8/2P5/8/3K4 w - - 0 1'
    },

    {
        path: ['TdB Chronologique', 'TdB3', 'Etude - Le Carré de Lasker'],
        title: 'TdB3-6 : Em. Lasker (Deutches Wochenschach und Berliner Schachzeitung, 1890)',
        fen: '2K5/2P4R/k7/8/8/8/2r4p/8 w - - 0 1'
    },


    // ---------- TdB Thématique ----------
    
    // ---------- TACTIQUE ----------
    // --------------- Tableaux de Mat ----------
      // ------------------- Mat avec Pièces Lourdes ----------

    {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes', 'Mat de l\'Escalier'],
        title: 'TdB1-6 : A. Mouterde (La Stratégie, 1922)',
        fen: '3kr2q/6Q1/8/8/8/4R3/8/K7 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat des Cochons Aveugles'],
        title: 'TdB12-1 : Swiderski - Nimzovitsch (Barmen, 1905)',
        fen: 'r4rk1/2R2p2/1n2N1pp/2Rp4/p2P4/P3P1QP/qP3PPK/8 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat des Cochons Aveugles'],
        title: 'TdB12-2 : Ivanchuk - Aronian (Morelia-Linares, 2006)',
        fen: '5rk1/1R1R1p1p/6p1/p1N1p3/5P2/1P4P1/r2nP1KP/8 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat des Cochons Aveugles'],
        title: 'TdB12-3 : Alekhine - Yates (Londres, 1922)',
        fen: 'r5r1/2R2Rpk/b3p2p/3pNp1P/p2P1K2/Pp2PPP1/1P6/8 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat du Couloir'],
        title: 'TdB1-1 : Fuster - Balogh (Budapest, 1945)',
        fen: '5rk1/5ppp/8/8/8/4PQ2/r1q2PPP/RR4K1 b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat du Couloir'],
        title: 'TdB1-2 : Rovner - Kamishov (Moscou, 1947)',
        fen: '1r1r2k1/2q2ppp/p3b3/4p3/1p2P3/5B2/PPPR1QPP/3R3K w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat du Couloir'],
        title: 'TdB1-3 : Teschner - Portisch (Monte Carlo, 1969)',
        fen: 'k1r1r3/pp5p/1q6/3R1Np1/1b6/1P3P2/2Q1R1PP/7K b - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat des Epaulettes'],
        title: 'TdB7-1 : van Wely - Morozevich (Wijk aan Zee, 2001)',
        fen: '1k1r4/pp1q1B1p/3bQp2/2p2r2/P6P/2BnP3/1P6/5RKR b - - 25 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat des Epaulettes'],
        title: 'TdB7-2 : Safarli - Rodshtein (Ile de Man, 2019)',
        fen: '5rkr/pp3p1p/2nq2pQ/3p1RN1/3P4/2P5/PP4PP/4R1K1 w - - 1 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat des Epaulettes'],
        title: 'TdB7-3 : Steinitz - NN (1861)',
        fen: 'r1q3kr/1p4p1/p1p2R1p/5p2/6PP/P3Q3/1P4P1/3R3K w - - 1 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat du Guéridon'],
        title: 'TdB8-1 : Tallantare - Ladelell (Newcastle, 1893)',
        fen: '5r1r/p3P1kp/1p4pq/4p3/2B5/8/P4QPP/6K1 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat du Guéridon'],
        title: 'TdB8-2 : von Holzhausen - Tarrasch (Francfort, 1912)',
        fen: 'r1bqr1k1/pppnbppp/2np4/8/2BNP3/2N4P/PPP2PP1/R1BQR1K1 w Qq - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat du Guéridon'],
        title: 'TdB8-3 : Pokojowczyk - Timochtchenko (Polanica-Zdroj, 1979)',
        fen: '4r1k1/5ppp/p2p1b1P/3P1bP1/1Q3P2/1P3K2/1P1R2R1/6Bq b - - 3 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat de Cozio'],
        title: 'TdB9-1 : Tasic – Dorfman (Nice, 1993)',
        fen: '2q5/1r2Bp1k/4pQpN/1pp1P2p/2p5/6P1/1P2PPKP/3r4 w - - 7 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat de Cozio'],
        title: 'TdB9-2 : Luo – Ismagambetov (Kuala Lumpur, 2002)',
        fen: '2r5/4k1pp/p2p4/BpnPp3/4q3/5Q2/PP1K1bPP/3R1R2 b - - 5 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat de Cozio'],
        title: 'TdB9-3 : Bellon Lopez – Smejkal (Siegen, 1970)',
        fen: '5rk1/1p1b3p/2pp2p1/p7/2Pb2Pq/1P1PpP2/P1N1K1RP/1RQ5 b - - 4 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat de Lolli'],
        title: 'TdB16-1 : Hoogendoorn - Günther (Nimègue, 1992)',
        fen: '1r3rk1/5ppp/p4P2/2pP4/2n1p3/1q6/1P1QB1PP/1R3RK1 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat de Lolli'],
        title: 'TdB16-2 : Bors - Szeberenyi (Hongrie, 2001)',
        fen: '2b1r1k1/pp3p1p/2p2Pp1/4P3/1qPR1Q2/6PP/6BK/8 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat de Lolli'],
        title: 'TdB16-3 : Menchik - Thomas (Londres, 1932)',
        fen: 'r4r2/q1pb1pkp/1p1p2p1/2nPpP1P/2P1P3/p1N2P2/PP1Q4/2KR1BR1 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat de Damiano'],
        title: 'TdB15-1 : Model - Goldberg (Leningrad, 1932)',
        fen: '2r2k1r/pB3pp1/4p3/Q1p1P3/3P2p1/2P1q3/PP3RP1/R5K1 b Qk - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat de Damiano'],
        title: 'TdB15-2 : NN - NN (Rapide, Chandler 1998, How to beat your Dad at Chess)',
        fen: 'k1rq3r/p1p2p2/1p2p1p1/P2pPn2/2nP1P1p/1NP5/2PBQ1PP/RR5K b Qk - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Lourdes','Mat de Damiano'],
        title: 'TdB15-3 : Baburine - Adianto (Liechtenstein, 1993)',
        fen: 'q1r1k2r/1b3pp1/p3p3/P1b4n/1pN1P2p/3BBP2/1P2Q1PP/R4R1K b Qk - 0 1'
    },


    
   
      // ------------------- Mat avec Pièce Lourde + Pièce Mineure ----------

      // ------------------- Mat avec Pièces Mineures ----------




      // --------------- Motifs Tactiques ----------
      // ------------------- La Fourchette ----------
      // ------------------- Le Clouage ----------
      // ------------------- Le Clouage en Croix ----------
      // ------------------- L'Enfilade ----------
      // ------------------- L'Attaque à la Découverte ----------
      // ------------------- La Déviation d'Ouverture de Ligne ----------
      // ------------------- L'Interception ----------
      // ------------------- L'Attaque aux Rayons-X ----------


      // --------------- Spéciales ----------
      // ------------------- Spéciale Philidor ----------
      // ------------------- Spéciale Timman ----------



 // ---------- FINALES ----------

// -------------------- Finales de Pions ----------
 
    {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', 'Pions bloqués (cc2)'],
        title: 'Ebersz (Magyar Sakkvilag, 1930)',
        fen: '8/1p5k/1P1p4/3p4/3Pp2p/2K1P2p/7P/8 w - - 0 1'
    },

    {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', 'Pions bloqués (cc2)'],
        title: 'Ebersz (Magyar Sakkvilag, 1930)',
        fen: '7k/p7/P2p4/P2Pp3/4P3/4P1p1/6P1/K7 w - - 0 1'
    },

    {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', 'Pions bloqués'],
        title: 'Zinar (Shakhmatnye Okonchaniya: Peshechnye, 1983)',
        fen: '5k2/1p6/pP2p3/Pp2P3/1P2P1p1/1K4P1/8/8 w - - 0 1'
    },

    {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', 'Pions bloqués'],
        title: 'Bähr (Opposition und Kritische Felder im Bauernendspiel, 1936)',
        fen: '8/1p5k/1P2p3/1P2P3/4P1p1/5pP1/5P2/1K6 w - - 0 1'
    },

    {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', 'Pions bloqués'],
        title: 'Zinar (Shakhmatnye Okonchaniya: Peshechnye, 1983)',
        fen: '8/1p5k/1P2p3/1P2P3/4P1p1/5pP1/K4P2/8 w - - 0 1'
    },

    {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', 'Pions bloqués'],
        title: 'Bianchetti (L\'Italia Scacchistica, 1925)',
        fen: '7k/1p6/1P2p3/1P2P3/4P1p1/6P1/8/K7 w - - 0 1'
    },

    // -------------------- Finales de Cavalierss ----------

    // -------------------- Finales de Fous ----------

    // -------------------- Finales de Tours ----------

    {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', 'fig: RTP vs RT', 'Pion-Tour', 'Pion en 7ème rangée'],
        title: 'Position de Lucena',
        fen: '1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1'
    },

    // -------------------- Finales de Dames ----------

    {
        path: ['TdB Thématique', 'FINALES', 'Finales de Dames', 'fig: RD vs RP', 'Pion-Tour en 7ème', 'Attaque verticale'],
        title: 'Attaque verticale',
        fen: 'Q7/8/8/8/1K6/8/pk6/8 w - - 0 1'
    }

    // -------------------- Finales de Pièces ----------


     // ---------- ETUDES ----------

];
