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


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de Balestra'],
        title: 'TdB19-1 : Kotronias - Arlandi (Yerevan, 1996)',
        fen: '7r/p3Q3/4p1k1/2p1Pb1p/8/2B2P2/rP3K2/8 w - - 4 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de Balestra'],
        title: 'TdB19-2 : Yanofsky - Reshevsky (Dallas, 1957)',
        fen: '8/3kP3/3b1Qp1/1q4B1/6P1/2p5/5P2/6K1 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de Balestra'],
        title: 'TdB19-3 : Millet - Franciskovic (Hersonissos, 2017)',
        fen: '3qr3/1p1k3b/2n1p2P/1NQpP1p1/1p4P1/5P2/1P2BK2/7R w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de l\'Opéra'],
        title: 'TdB6-1 : van Vliet - Passmore (Londres, 1900)',
        fen: '4r1k1/p3bp1p/1p4p1/3q1p2/8/1P2PR1Q/PBr3PP/R5K1 w Q - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de l\'Opéra'],
        title: 'TdB6-2 : Muellneritsch - Eichert (Raika, 1999)',
        fen: 'r5kr/p1q2p2/bpn1p1p1/3pP1BQ/3P4/b1PB1R2/P4PPP/R5K1 w Q - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de l\'Opéra'],
        title: 'TdB6-3 : Belenky - Pirogov (Moscou, 1975)',
        fen: '3rr1k1/1bp2ppp/p7/1p1q4/3P1B2/2P3P1/PP5K/RN1Q2R1 b - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de Greco'],
        title: 'TdB13-1 : Johnston - Marshall (Chicago, 1899)',
        fen: 'r2q1rk1/pbp3pp/1p1b4/3N1p2/2B5/P3PPn1/1P3P1P/2RQK2R w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de Greco'],
        title: 'TdB13-2 : Nimzowitsch - Capablanca (San Sebastian, 1911)',
        fen: '5r1k/p3n1pp/1p6/1PP2p2/P2Pn3/3b1Bb1/1B4P1/R1R4K b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de Greco'],
        title: 'TdB13-3 : Aleksandrov - Zaitsev (URSS, 1973)',
        fen: '2k1r2r/ppn3pq/b7/5p2/5Qn1/2N1B1P1/1P3PB1/2RR2K1 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de Pillsbury'],
        title: 'TdB18-1 : Stepanow - NN (Riga, 1899)',
        fen: 'r2q1rk1/ppp2ppp/2np4/8/4P3/P2n1P1P/1BB2P1K/R5R1 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de Pillsbury'],
        title: 'TdB18-2 : Savic - Radojevic (Herceg Novi, 2006)',
        fen: '5rk1/prp2p1p/4n2B/7p/1qBPP2P/1P3P2/P2Q1P2/1K5R w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de Pillsbury'],
        title: 'TdB18-3 : Pillsbury - Newman (Philadelphie, 1900)',
        fen: '5rk1/prpn1p1p/1p3p1B/8/3P4/4P3/PP3PqP/R2QK2R w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de Morphy'],
        title: 'TdB17-1 : Palmer - Moody (Cadillac USA, 2019)',
        fen: '4r2k/1p3p1p/p2r4/6B1/P1bp2R1/2N5/1P5P/6RK w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de Morphy'],
        title: 'TdB17-2 : Reshevsky - Shainswit (New York, 1951)',
        fen: '2r2rk1/5ppp/pp6/2q5/2P1pP2/3QPRnP/P5P1/B1R3K1 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de Morphy'],
        title: 'TdB17-3 : Nimzowitsch - Nielsen (Copenhague, 1930)',
        fen: '3r1rk1/p2R1ppp/1p1bp3/3qB3/3PR3/5Q1P/PP3PP1/6K1 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat Arabe'],
        title: 'TdB4-1 : Andriasian - Burg (Groningue, 2021)',
        fen: 'r4nk1/pp2r1p1/2p1P2p/3p1P1N/8/8/PPPK4/6RR w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat Arabe'],
        title: 'TdB4-2 : Anderssen - Schallopp (Berlin, 1864)',
        fen: '6k1/3R2pp/8/6r1/3n1p2/1P3P1K/P1r3P1/4R3 b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat Arabe'],
        title: 'TdB4-3 : Gelfand - Kramnik (Berlin, 1996)',
        fen: '1r4k1/p5pp/4q3/2Q2pP1/3N4/Prn1P3/1P1B1P1P/KR6 b - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de l\'Hameçon'],
        title: 'TdB11-1 : Kazhgaleiev - J. Polgar (Calatrava, 2007)',
        fen: '1r4k1/2R5/3p4/3P2B1/p1p4p/2b2RnP/P5P1/6K1 b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de l\'Hameçon'],
        title: 'TdB11-2 : Gagunashvili - Kalegin (Moscou, 2006)',
        fen: '1Qb5/5pk1/6p1/3N2P1/7p/p6P/6BK/2q5 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de l\'Hameçon'],
        title: 'TdB11-3 : Bulmaga - Kashlinskaya (Kharkov, 2007)',
        fen: '6kr/3b3r/2p2p2/1p1q1P2/p2p2pN/3P4/PPP1RKPQ/7R w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de Vukovic'],
        title: 'TdB10-1 : Torre - Ljubojevic (Manille, 1976)',
        fen: '6k1/1R6/8/3NKN1p/1P2p3/2P2r2/5r2/8 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de Vukovic'],
        title: 'TdB10-2 : Spassky - Larsen (Malmö, 1968)',
        fen: '3r1k2/1R6/5N2/p2PP1K1/8/7P/5p2/3b4 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat de Vukovic'],
        title: 'TdB10-3 : Schiller - Redman (Chicago, 1975)',
        fen: '4Qbr1/2q4p/knNp4/3P1p2/P1p5/2P3P1/5P1P/1R4K1 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat d\'Anastasia'],
        title: 'TdB3-1 : Bayer - Falkbeer (Vienne, 1852)',
        fen: 'Q7/p1p1k1pp/1b6/7q/3n1r2/8/P4PPP/RN3RK1 b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat d\'Anastasia'],
        title: 'TdB3-2 : Kamyshov - Sokolski (Leningrad, 1936)',
        fen: '6k1/p4p1p/3p1p2/2p1r3/2PnrqN1/P6P/1P1Q1PP1/3R1RK1 b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièce Lourde + Pièce Mineure','Mat d\'Anastasia'],
        title: 'TdB3-3 : Vidmar - Euwe (Karlsbad, 1929)',
        fen: '6k1/5pb1/1p1N3p/p5p1/5q2/Q6P/PPr5/3RR1K1 w - - 0 1'
    },


      // ------------------- Mat avec Pièces Mineures ----------

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Mineures','Mat de Blackburne'],
        title: 'TdB20-1 : Stefánsson - Bruzón Batista (La Havane, 2001)',
        fen: '2q1rrk1/1b1pb2p/p3p1p1/1p2B1Nn/4BP2/PP6/2P1Q1PP/R4R1K w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Mineures','Mat de Blackburne'],
        title: 'TdB20-2 : Flohr - Pitschak (Bilina, 1930)',
        fen: 'r2r2k1/pb3ppp/1p1bpn2/7q/3n4/1P1B2P1/PB1N1P1P/RQ2NRK1 b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Mineures','Mat de Blackburne'],
        title: 'TdB20-3 : Olesen - Buehl (Dearborn, 1992)',
        fen: '3b1rk1/p1q2p1p/bp2p1p1/2p2nNn/2P3N1/7Q/PB3PPP/1BR3K1 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Mineures','Mat de Boden'],
        title: 'TdB2-1 : Ed. Lasker - Englund (Scheveningue 1913)',
        fen: '2kr1b1r/pp3ppp/2p1b2q/4B3/4Q3/2PB2R1/PPP2PPP/3R2K1 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Mineures','Mat de Boden'],
        title: 'TdB2-2 : Morphy - Thompson (New York, 1859)',
        fen: 'r2k1r2/pp1b2pp/1b2Pn2/2p5/Q1B2Bq1/2P5/P5PP/3R1RK1 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Mineures','Mat de Boden'],
        title: 'TdB2-3 : Schulder - Boden (Londres, 1860)',
        fen: '2k1rb1r/ppp3pp/2np1q2/5b2/2B2P2/2P1BQ2/PP1N1P1P/2KR3R b - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Mineures','Mat du Corridor Diagonal'],
        title: 'TdB14-1 : Morphy - NN (Nouvelle Orléans, 1850)',
        fen: 'r1bq3r/ppk3pp/3b4/3Q4/3p1B2/8/PPP2PPP/4R1K1 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Mineures','Mat du Corridor Diagonal'],
        title: 'TdB14-2 : Capablanca - Spielmann (San Sebastian, 1911)',
        fen: '7k/ppq1b1pp/8/2P5/1P2R1Q1/2P5/P2B1rPp/7K w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Mineures','Mat du Corridor Diagonal'],
        title: 'TdB14-3 : Fernandez - Lommer (Valence, 1967)',
        fen: '2r4k/7p/8/8/4Q3/1P1B4/P2p1q2/K2R4 b - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Mineures','Mat de Lucena'],
        title: 'TdB5-1 : Almeida - Feijoeiro (Lisbonne, 1993)',
        fen: 'r1b1r3/pp1nBkbp/1qpQ2p1/8/4PPn1/2N2N2/PPP3PP/R4R1K w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Mineures','Mat de Lucena'],
        title: 'TdB5-2 : Beier - Breithut (Schney, 1993)',
        fen: 'r3r1k1/1b2ppbp/p4np1/1pq5/5B2/1BP2N1P/PP2QPP1/3R1RK1 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Tableaux de Mat', 'Mat avec Pièces Mineures','Mat de Lucena'],
        title: 'TdB5-3 : Zatulovskaïa - Skegina (Sotchi, 1982)',
        fen: '2rr2k1/p5bp/1pn1R3/2pp1pN1/5P2/1Pq3P1/P2Q1B1P/3R1K2 w - - 0 1'
    },



      // --------------- Motifs Tactiques ----------
      // ------------------- La Fourchette ----------
      // ------------------- Le Clouage ----------
      // ------------------- Le Clouage en Croix ----------
      // ------------------- L'Enfilade ----------
      // ------------------- L'Attaque à la Découverte ----------
      // ------------------- La Déviation d'Ouverture de Ligne ----------
      // ------------------- L'Interception ----------
      // ------------------- L'Attaque aux Rayons-X ----------

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'La Fourchette'],
        title: 'TdB21-1 : Euwe - Davidson (Amsterdam, 1924)',
        fen: '6k1/p4p1p/1p3np1/2q5/4p3/4P1N1/PP3PPP/3Q2K1 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'La Fourchette'],
        title: 'TdB21-2 : Petrossian - Spassky (Moscou, 1966)',
        fen: '6k1/r4r1p/p2NB3/nppP2q1/2P5/1P2N3/PQ5P/7K w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'La Fourchette'],
        title: 'TdB21-3 : Bogolioubov - Müller (Triberg, 1934)',
        fen: '2k4r/1pp2ppp/p1p1bn2/4N3/1q1rP3/2N1Q3/PPP2PPP/R4RK1 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'Le Clouage'],
        title: 'TdB22-1 : Bründtrup - Budrich (Berlín, 1954)',
        fen: '5k2/6p1/p2q3p/b7/2QB4/7P/P5P1/6K1 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'Le Clouage'],
        title: 'TdB22-2 : Kieninger - Herrmann (Bad Oeynhausen, 1940)',
        fen: '8/4kpp1/4p1p1/Q2pP1P1/2pR1P2/PrP3Pq/1P6/2K5 w - - 1 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'Le Clouage'],
        title: 'TdB22-3 : Lexandrovitch - Krummhauer (Berlin, 1951) (variante)',
        fen: '8/4kpp1/4p1p1/Q2pP1P1/2pR1P2/PrP3Pq/1P6/2K5 w - - 1 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'Le Clouage en Croix'],
        title: 'TdB26-1 : Bogatyriev - Sagoryanski (Moscou, 1947)',
        fen: '8/5p1k/6pp/8/5P2/r2R2KP/3Q2P1/6q1 b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'Le Clouage en Croix'],
        title: 'TdB26-2 : Halosar - Poschauko (Graz, 1941)',
        fen: '1r4k1/4qppp/Q2pb3/8/8/b1P5/PP3PPP/1KB2B1R b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'Le Clouage en Croix'],
        title: 'TdB26-3 : Pidorich - Chernusov (Tjumen, 1981)',
        fen: 'r5k1/5Rpp/1bqp4/1p1bp3/1P6/1BP4P/1B2QPP1/6K1 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'L\'Enfilade'],
        title: 'TdB23-1 : Rivera - Fischer (1962, Varna)',
        fen: 'r4rk1/pbq2ppp/1p2pn2/n1p5/3P4/PBP1P1N1/1B3PPP/2RQ1RK1 b q - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'L\'Enfilade'],
        title: 'TdB23-2 : Byrne - Tarjan (Oberlin, 1975)',
        fen: '1q4k1/4pR2/p3r1p1/6P1/8/P1P2Q2/KP6/8 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'L\'Enfilade'],
        title: 'TdB23-3 : Short - Vaganian (Barcelone, 1989)',
        fen: '2Q5/1pR3r1/p4k2/6p1/P2qb3/6BP/5PP1/6K1 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'L\'Attaque à la Découverte'],
        title: 'TdB27-1 : Réti - Tartakover (Vienne, 1910)',
        fen: 'rnb1kb1r/pp3ppp/2p5/4q3/4n3/3Q4/PPPB1PPP/2KR1BNR w kq - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'L\'Attaque à la Découverte'],
        title: 'TdB27-2 : Ed. Lasker - Thomas (Londres, 1912)',
        fen: 'rn3rk1/pbppq1pp/1p2pb2/4N2Q/3PN3/3B4/PPP2PPP/R3K2R w KQ - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'L\'Attaque à la Découverte'],
        title: 'TdB27-3 : Anand - Lautier (Bienne, 1997)',
        fen: '3rk2r/pR3p1p/2p1p2p/3n4/3q2P1/3BRP2/P1P2Kb1/2BQ4 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'La Déviation d\'Ouverture de Ligne'],
        title: 'TdB24-1 : Torre - Timman (Hambourg, 1982)',
        fen: '4r1k1/1pQ3pp/2p2p2/P3n3/6b1/6P1/1P2PP1P/1R1NqBK1 b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'La Déviation d\'Ouverture de Ligne'],
        title: 'TdB24-2 : Timman - Tatai (Amsterdam, 1977)',
        fen: '4k3/pr2rp1p/q2pbQ2/8/2N5/6R1/P4PPP/4R1K1 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'La Déviation d\'Ouverture de Ligne'],
        title: 'TdB24-3 : Kovačević - Timman (Bugojno, 1984)',
        fen: '2r1r1k1/p4pp1/1p1Pn1p1/6q1/P5P1/BP2Pp1P/5P2/Q1RR2K1 b - - 0 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'L\'Interception'],
        title: 'TdB25-1 : Réti - Bogolioubov (New York, 1924)',
        fen: '3r1bk1/ppq3pp/2p5/2P2Q1B/8/1P4P1/P6P/5RK1 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'L\'Interception'],
        title: 'TdB25-2 : Gustafsson - Seger (Hambourg, 2001)',
        fen: '4r1k1/1n1q1pbp/6p1/p2r4/2Q5/B7/P3NPPP/2R2RK1 b - - 1 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'L\'Interception'],
        title: 'TdB25-3 : Turner - Howell (West Bromwich, 2004)',
        fen: '5r2/pp5r/4b1pk/2q4p/2P3P1/2Q1N3/P4P2/3R1K1R w - - 1 1'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'L\'Attaque aux Rayons-X'],
        title: 'TdB28-1 : Frit - Moreau (Ste Foy d\'Aigrefeuille, 2026)',
        fen: '2r5/2Pk4/pBR1p3/P3P3/3p4/2bK4/8/8 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'L\'Attaque aux Rayons-X'],
        title: 'TdB28-2 : Tisdall - J. Polgar (Reykjavik, 1988)',
        fen: 'k7/1p1q1pp1/p2p4/P2Pn1P1/4R2r/5N2/KPP1Q1R1/7r b - - 1 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Motifs Tactiques', 'L\'Attaque aux Rayons-X'],
        title: 'TdB28-3 : Rakolta - Janoczy (Tchécoslovaquie, 1978)',
        fen: 'k7/p1p1p3/2P5/8/3rR3/8/PP2Qq2/K7 w - - 0 1'
    },


      // --------------- Spéciales ----------
      // ------------------- Spéciale Philidor ----------
      // ------------------- Spéciale Timman ----------


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Séries Spéciales', 'Spéciale Philidor'],
        title: 'TdB29-1 : von Brühl - Philidor (Londres, 1783)',
        fen: '3R4/5k2/3P3P/8/5p2/4p2P/3r4/5K2 b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Séries Spéciales', 'Spéciale Philidor'],
        title: 'TdB29-2 : Philidor - von Brühl (Londres, 1788)',
        fen: '2b1k3/5r2/4pBpP/3pP1P1/2pP2BK/1pP5/1P6/8 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Séries Spéciales', 'Spéciale Philidor'],
        title: 'TdB29-3 : Philidor - von Brühl (Londres, 1789)',
        fen: 'r2n1rbk/1p1qn1pp/pb2p3/3pP2P/1P1P1PP1/P3BNK1/R7/1B1Q3R w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Séries Spéciales', 'Spéciale Philidor'],
        title: 'TdB29-7 : Morphy - Duc de Brunswick & Comte Isouard (Paris, 1858)',
        fen: '3rkb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR3R w k - 3 13'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Séries Spéciales', 'Spéciale Philidor'],
        title: 'TdB29-8 : van der Wiel - van Baarle (Amsterdam, 1983)',
        fen: 'r1bqk2r/pp1nbppp/2p4n/4p1N1/2B1P3/8/PPP2PPP/RNBQ1RK1 w kq - 4 8'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Séries Spéciales', 'Spéciale Philidor'],
        title: 'TdB29-9 : E. Adams - C. Torre (Nouvelle Orléans, 1920)',
        fen: '2r1r1k1/1p1q1ppp/3p1b2/p2P4/3Q4/5N2/PP2RPPP/4R1K1 w - - 0 18'
    },


     {
        path: ['TdB Thématique', 'TACTIQUE', 'Séries Spéciales', 'Spéciale Timman'],
        title: 'TdB24-1 : Torre - Timman (Hambourg, 1982)',
        fen: '4r1k1/1pQ3pp/2p2p2/P3n3/6b1/6P1/1P2PP1P/1R1NqBK1 b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Séries Spéciales', 'Spéciale Timman'],
        title: 'TdB24-2 : Timman - Tatai (Amsterdam, 1977)',
        fen: '4k3/pr2rp1p/q2pbQ2/8/2N5/6R1/P4PPP/4R1K1 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'TACTIQUE', 'Séries Spéciales', 'Spéciale Timman'],
        title: 'TdB24-3 : Kovačević - Timman (Bugojno, 1984)',
        fen: '2r1r1k1/p4pp1/1p1Pn1p1/6q1/P5P1/BP2Pp1P/5P2/Q1RR2K1 b - - 0 1'
    },



// ---------- FINALES ----------

// -------------------- Finales de Pions ----------
// ------------------------- RP vs R ----------
// ------------------------- RP vs RP ----------
// ------------------------- RPP vs RP ----------
 


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', '{RP} vs {r} - Cases Clés du {P} passé'],
        title: 'TdB3-4 : J. Drtina (Casopis Ceskych Sachistu, 1908)',
        fen: '5k2/8/8/8/8/2P5/8/3K4 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', '{RP} vs {r} - Cases Clés du {P} passé'],
        title: 'TdB3-5 : d\'après J. Drtina',
        fen: '4k3/8/8/8/8/2P5/8/3K4 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', '{RP} vs {rp}', '{P}/{p} bloqués - Le Trébuchet'],
        title: 'TdB5-4 : P.A. Durand (La Régence, 1860)',
        fen: '8/8/1k1p4/3P1K2/8/8/8/8 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', '{RP} vs {rp}', '{P}/{p} bloqués - Le Trébuchet'],
        title: 'TdB5-5 : P.A. Durand (La Régence, 1860)',
        fen: '8/8/8/1k1p4/3P1K2/8/8/8 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', '{RP} vs {rp}', '{P}/{p} bloqués - Cases Clés'],
        title: 'TdB9-4 : A. Villeneuve (Les Finales, 1982)',
        fen: '4k3/8/4p3/4P3/8/3K4/8/8 w - - 8 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', '{RP} vs {rp}', '{P}/{p} bloqués - Cases Clés'],
        title: 'TdB9-5 : Inédit (TdB9, 2025)',
        fen: '3k4/8/4p3/4P3/8/2K5/8/8 w - - 8 1'
    },

    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', '{RPP} vs {rp}', '{P}/{p} bloqués + {P} arriéré - Cases Clés'],
        title: 'TdB11-4 : Kovacs - Rigo (Hongrie, 1973)',
        fen: '1K6/8/4k3/8/5p2/5P2/4P3/8 b - - 11 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', '{RPP} vs {rp}', '{P}/{p} bloqués + {P} arriéré - Cases Clés'],
        title: 'TdB11-5 : Baron Rodriguez - Minzer (Mancha Real, 2000)',
        fen: '8/3k4/3p4/3P4/2PK4/8/8/8 b - - 21 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', '{RPP} vs {rp}', '{P}/{p} bloqués + {P} arriéré - Cases Clés'],
        title: 'TdB11-6 : F. Dedrle (Deutsches Wochenschach, 1921)',
        fen: '8/4k3/3p4/3P4/2P5/8/8/5K2 w - - 11 1'
    },


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', '{RPP} vs {rp}', '{P}/{p} bloqués + {P} passé protégé - Cases Clés'],
        title: 'TdB18-4 : J. Buijs & R. Hendriks (Spiegelen Springen Schuiven Draaien, 1993)',
        fen: '8/8/8/4k3/6pP/6P1/K7/8 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', '{RPP} vs {rp}', '{P}/{p} bloqués + {P} passé protégé - Cases Clés'],
        title: 'TdB18-5 : F. Dedrle (Studie, 1925)',
        fen: '8/2k5/8/8/Pp6/1P6/6K1/8 b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', '{RPP} vs {rp}', '{P}/{p} bloqués + {P} passé protégé - Cases Clés'],
        title: 'TdB18-6 : R. Bianchetti (Contributo alla Teoria dei Finali di soli Pedoni, 1925)',
        fen: '8/8/1p6/pP6/8/K7/8/k7 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', '{RPP} vs {rp}', '{P}/{p}-Tour bloqués + {P} passé protégé - Règles de Bähr'],
        title: 'TdB27-4 : Laskiewicz - Framberk (Chrudim, 2002)',
        fen: '8/8/5k2/p7/P4PK1/8/8/8 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', '{RPP} vs {rp}', '{P}/{p}-Tour bloqués + {P} passé protégé - Règles de Bähr'],
        title: 'TdB27-5 : Manatakis - Niarhos (La Canée, 2003)',
        fen: '8/8/p5rk/6R1/P4K1P/8/8/8 b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', '{RPP} vs {rp}', '{P}/{p}-Tour bloqués + {P} passé protégé - Règles de Bähr'],
        title: 'TdB27-6 : W. Bähr (Der Alemanne, 1935)',
        fen: '8/4k3/p7/P6p/7P/5K2/8/8 w - - 0 1'
    },



// -------------------- Finales de Cavaliers ----------
// ------------------------- RC vs RP ----------


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Cavaliers', '{RC} vs {rp}', '{p}-Tour'],
        title: 'TdB2-4 : J. de La Villa (Los 100 Finales que hay que saber, 2008)',
        fen: '7K/8/8/8/7N/7p/7k/8 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Cavaliers', '{RC} vs {rp}', '{p}-Tour'],
        title: 'TdB2-5 : J. Levitt (1997)',
        fen: '7K/8/8/8/7N/7p/8/7k w - - 0 1'
    },


    
// -------------------- Finales de Fous ----------
// ------------------------- RFP vs RF ----------

 

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Fous', '{RFP} vs {rf}', '{F}/{f} de même couleur - Règle de Centurini'],
        title: 'TdB7-4 : Y. Averbakh (Comprehensive Chess Endings, 2012)',
        fen: '8/1K6/2P5/1k4B1/8/6b1/8/8 w - - 12 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Fous', '{RFP} vs {rf}', '{F}/{f} de même couleur - Règle de Centurini'],
        title: 'TdB7-5 : J. de la Villa (Los 100 Finales que hay que saber, 2008)',
        fen: '8/K7/1P6/k4B2/8/5b2/8/8 w - - 12 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Fous', '{RFP} vs {rf}', '{F}/{f} de même couleur - Règle de Centurini'],
        title: 'TdB7-6 : L. Centurini (La Régence, 1856)',
        fen: '2KB4/1P6/2k5/8/8/8/7b/8 w - - 12 1'
    },



// -------------------- Finales de Tours ----------

// ------------------------- RT vs RP(P) ----------


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RT} vs {rp} - La Coupure en 5e'],
        title: 'TdB6-4 : M. Dvoretsky (Manuel des Finales, 2004)',
        fen: '7K/6R1/1k6/p7/8/8/8/8 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RT} vs {rp} - La Coupure en 5e'],
        title: 'TdB6-5 : J. de la Villa (Los 100 Finales que hay que saber, 2008)',
        fen: '6KR/8/pk6/8/8/8/8/8 b - - 0 1'
    },

    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RT} vs {rp} - L\'Echelle de Saavedra'],
        title: 'TdB2-6 : F. Saavedra / G .E. Barbier (Glasgow Weekly Citizen, 1895)',
        fen: '8/8/1KP5/3r4/8/8/8/k7 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RT} vs {rpp}', '{pp} passés liés éloignés des Rois'],
        title: 'TdB8-4 : J. Moravec (28 Rijen, 1924)',
        fen: '8/k7/2K5/8/8/8/6pp/1R6 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RT} vs {rpp}', '{pp} passés liés éloignés des Rois'],
        title: 'TdB8-5 : J. Kling & B. Horwitz (Chess Studies, 1851)',
        fen: '8/8/5K2/7k/8/p7/1p6/1R6 w - - 9 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RT} vs {rpp}', '{pp} passés liés éloignés des Rois'],
        title: 'TdB8-6 : M. Schapiro (Rheinische Volkswacht, 1920)',
        fen: '8/8/8/3R4/2K5/6pp/k7/8 w - - 0 1'
    },


// ------------------------- RTP vs RT ----------



     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', 'L\'Enfilade en Finales de Tours'],
        title: 'TdB23-4 : Hebden - Speelman (Southend, 2000)',
        fen: '8/4k3/PR6/7r/4K3/8/8/8 w - - 0 1'
    },
     
    {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', 'L\'Enfilade en Finales de Tours'],
        title: 'TdB23-4 : Bernstein - Smyslov (Groningue, 1946)',
        fen: '1R6/8/8/5k2/5p2/7r/1p2K3/8 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{r} devant le {P}', 'Défense Passive'],
        title: 'TdB10-4 : M. Dvoretsky (Le Manuel des Finales, 2004)',
        fen: 'r5k1/8/5PK1/8/8/8/8/1R6 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{r} devant le {P}', 'Défense Passive'],
        title: 'TdB10-5 : M. Dvoretsky (Le Manuel des Finales, 2004)',
        fen: 'r5k1/8/6PK/8/8/8/8/1R6 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{r} devant le {P}', '{P} en 5e - La Défense de Philidor'],
        title: 'TdB22-4 : Danilov - Gheng (Miercurea Ciuc, 2001)',
        fen: '4k3/R7/5K2/4P2r/8/8/8/8 b - - 0 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{r} devant le {P}', '{P} en 5e - La Défense de Philidor'],
        title: 'TdB22-5 : Laudati - Pienabarca (Rome, 1997)',
        fen: '8/8/8/8/7r/1R3pk1/8/6K1 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{r} devant le {P}', '{P} en 5e - La Défense de Karstedt avec {P} central'],
        title: 'TdB25-4 : Piquemal - Bourguet (France, 2004)',
        fen: '1R6/8/8/8/4p3/5k2/r7/4K3 w - - 0 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{r} devant le {P}', '{P} en 5e - La Défense de Karstedt avec {P} central'],
        title: 'TdB25-5 : Zournatsidis - Le Roux (Patras, 2001)',
        fen: '1R6/8/8/8/4p3/5k2/r7/5K2 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{r} devant le {P}', '{P} en 5e - La Défense de Karstedt avec {P}-Fou'],
        title: 'TdB26-4 : Petran - Le (Budapest, 1997)',
        fen: '5k2/R7/6K1/5P2/8/8/8/1r6 b - - 0 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{r} devant le {P}', '{P} en 5e - La Défense de Karstedt avec {P}-Fou'],
        title: 'TdB26-5 : Gebhardt - Bogdanovich (Baden, 2010)',
        fen: '8/2P5/R7/5p2/p7/5k2/7K/2r5 b - - 0 1'
    },


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{r} coupé verticalement', '{P} en 7e - {R} devant', 'Position de Lucena'],
        title: 'TdB21-4 : A. Salvio (Il Puttino, 1634)',
        fen: '1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{r} coupé verticalement', '{P} en 7e - {R} devant', 'Position de Lucena'],
        title: 'TdB21-5 : Frit - Iagar (Muret, 2025)',
        fen: '2K5/2P1k3/5pp1/4p2p/7P/6P1/3R1P2/1r6 w - - 1 1'
    },
    

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{r} coupé verticalement', '{P} en 7e - {R} devant', 'Défense Latérale - Règle de Ste Foy'],
        title: 'TdB28-4 : Arat - Özen (Izmir, 2017)',
        fen: '5r2/8/8/8/8/8/R3p1K1/4k3 w - - 0 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{r} coupé verticalement', '{P} en 7e - {R} devant', 'Défense Latérale - Règle de Ste Foy'],
        title: 'TdB28-5 : Heinz - Müller (Fürth, 1999)',
        fen: '4KR2/r3P1k1/8/8/8/8/8/8 w - - 2 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{r} coupé verticalement', '{P} en 7e - {R} devant', 'Défense Latérale - Règle de Ste Foy'],
        title: 'TdB28-6 : N.A. Kopaiev (Shakhmaty v SSSR, 1953)',
        fen: '2r2K1k/5P2/8/8/8/8/8/6R1 w - - 1 1'
    },


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{r} coupé verticalement', '{P} dans son camp - Règle des 5'],
        title: 'TdB24-4 : Timman - Tseshkovsky (Portoroz, 1979)',
        fen: '8/8/8/7r/1K1P4/6k1/4R3/8 w - - 0 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{r} coupé verticalement', '{P} dans son camp - Règle des 5'],
        title: 'TdB24-5 : Ostojic - Timman (Venise, 1974)',
        fen: '8/4k3/7R/3K1p1p/8/8/8/5r2 b - - 0 1'
    },



// ------------------------------ Pion-Tour en 7e ----------

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{P}-Tour en 7e', '{T} devant le {P}', 'Défense du Triangle'],
        title: 'TdB13-4 : Moorehouse - Stephenson (London, Canada, 1995)',
        fen: '8/5k2/R7/8/8/5K2/p7/r7 w - - 0 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{P}-Tour en 7e', '{T} devant le {P}', 'Défense du Triangle'],
        title: 'TdB13-5 : Pogonina - Straub (Internet, 2004)',
        fen: '8/6p1/8/R4p1k/5P2/8/p5K1/r7 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{P}-Tour en 7e', '{T} devant le {P}', 'Défense par Ecran du {R}'],
        title: 'TdB14-4 : J. Berger (Theorie und Praxis der Endspiele, 1890)',
        fen: 'R7/P5K1/8/6k1/8/8/8/r7 w - - 0 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{P}-Tour en 7e', '{T} devant le {P}', 'Défense par Ecran du {R}'],
        title: 'TdB14-5 : B. Marik (Ceskoslovensky Sach, 1953)',
        fen: 'R6K/P7/8/8/8/7k/8/r7 w - - 0 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{P}-Tour en 7e', '{T} devant le {P}', 'Défense par Ecran du {R}'],
        title: 'TdB14-6 : Kolinski - Kuziemko (Kolobrzeg, 2009)',
        fen: '7R/7P/4pK2/8/4k3/8/8/6r1 b - - 0 1'
    },


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{P}-Tour en 7e', '{T} devant le {P}', 'Défense par Ecran de la {t}', 'Batterie {tr} éloignée du {P}'],
        title: 'TdB15-4 : N. Kopaiev & Y. Averbakh (Shakhmatnye Okonchaniya, 1958)',
        fen: 'R7/P2K4/7k/8/8/8/8/6r1 b - - 0 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{P}-Tour en 7e', '{T} devant le {P}', 'Défense par Ecran de la {t}', 'Batterie {tr} éloignée du {P}'],
        title: 'TdB15-5 : Zaitsenkov - Logun (Tallinn, 2001)',
        fen: '8/8/8/5k2/8/2K5/3R3p/7r w - - 0 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{P}-Tour en 7e', '{T} devant le {P}', 'Défense par Ecran de la {t}', 'Batterie {tr} éloignée du {P}'],
        title: 'TdB15-6 : P. Romanovsky (Shakhmaty v SSSR, 1938)',
        fen: 'R7/P6r/8/1K6/8/8/7k/8 w - - 0 1'
    },

    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{P}-Tour en 7e', '{T} devant le {P}', 'Défense par Ecran de la {t}', 'Batterie {tr} proche du {P}'],
        title: 'TdB16-4 : Tarrasch - Johner (Teplitz-Schönau, 1922)',
        fen: 'R7/P6r/8/3k4/8/2K5/8/8 b - - 0 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{P}-Tour en 7e', '{T} devant le {P}', 'Défense par Ecran de la {t}', 'Batterie {tr} proche du {P}'],
        title: 'TdB16-5 : Bodrogi - Torok (Budapest, 2009)',
        fen: '7R/3r3P/8/4k3/5p2/8/4K3/8 b - - 13 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{P}-Tour en 7e', '{T} devant le {P}', 'Défense par Ecran de la {t}', 'Batterie {tr} proche du {P}'],
        title: 'TdB16-6 : A. Chéron (La Fin de Partie : Une Tour et un Pion contre une Tour, 1923)',
        fen: 'R7/P1r5/8/8/8/8/8/K1k5 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{P}-Tour en 7e', '{T} devant le {P}', 'Défense par Ecran de la {t}', 'Batterie {tr} proche du {P}'],
        title: 'TdB16-7 : A. Chéron (La Fin de Partie : Une Tour et un Pion contre une Tour, 1923)',
        fen: 'R7/P1r5/8/8/8/8/8/K1k5 b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{P}-Tour en 7e', '{T} devant le {P}', 'Défense par Ecran de la {t}', 'Batterie {tr} centrale'],
        title: 'TdB17-4 : Murshed - Serper (Dhaka, 1995)',
        fen: '8/3k4/8/8/3K4/8/p3R3/r7 w - - 7 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{P}-Tour en 7e', '{T} devant le {P}', 'Défense par Ecran de la {t}', 'Batterie {tr} centrale'],
        title: 'TdB17-5 : Ionescu - Gutman (Bienne, 1990)',
        fen: 'R7/P2r4/4k3/8/4K3/8/8/8 b - - 0 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Tours', '{RTP} vs {rt}', '{P}-Tour en 7e', '{T} devant le {P}', 'Défense par Ecran de la {t}', 'Batterie {tr} centrale'],
        title: 'TdB17-6 : J. Moravec (Československý Šach, 1931)',
        fen: '8/8/8/2k5/8/4K3/3R3p/7r w - - 0 1'
    },



// -------------------- Finales de Dames ----------
// ------------------------- RD vs RD ----------
// ------------------------- RD vs RP ----------

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Dames', '{RD} vs {rd}'],
        title: 'TdB1-4 : J. de la Villa (Los 100 Finales que hay que saber, 2008)',
        fen: '8/6P1/8/8/5K2/8/6k1/7q w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Dames', '{RD} vs {rd}'],
        title: 'TdB1-5 : Anand - Thipsay (Coimbatore, 1987)',
        fen: '2Q5/8/8/8/8/3K4/1k6/q7 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Dames', '{RD} vs {rp}', '{p}-Fou en 6e'],
        title: 'TdB4-4 : I.A. Horowitz (How to Win in the Chess Endings, 1957)',
        fen: '8/5K1Q/8/8/8/2p5/8/k7 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Dames', '{RD} vs {rp}', '{p}-Fou en 6e'],
        title: 'TdB4-5 : I.A. Horowitz (How to Win in the Chess Endings, 1957)',
        fen: '8/6KQ/8/8/8/2p5/8/k7 w - - 0 1'
    },


     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Dames', '{RD} vs {rp}', '{p}-Tour en 7e'],
        title: 'TdB12-4 : Hernando Rodrigo - Sorroche Martin (Vila de Salou, 1995)',
        fen: '6Q1/8/8/6K1/8/8/6kp/8 w - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Dames', '{RD} vs {rp}', '{p}-Tour en 7e'],
        title: 'TdB12-5 : Leentjens - Huizinga (Groningue, 2004)',
        fen: '8/2Q5/8/8/8/8/pk2K3/8 w - - 0 1'
    },
    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Dames', '{RD} vs {rp}', '{p}-Tour en 7e'],
        title: 'TdB12-6 : A. Salvio (Trattato dell\'Inventione et Arte Liberale del Gioco di Scacchi, 1634)',
        fen: '8/1QK5/8/8/8/8/p7/k7 w - - 0 1'
    },

    
     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Dames', '{RD} vs {rp}', '{p}-Fou en 7e', '{r} du petit côté'],
        title: 'TdB19-4 : Seidemann - Jahn (Eilenbourg, 1984)',
        fen: '8/1qk2PK1/8/8/8/8/8/8 b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Dames', '{RD} vs {rp}', '{p}-Fou en 7e', '{r} du petit côté'],
        title: 'TdB19-5 : Sundell - von Bahr (Haninge, 1997)',
        fen: '6K1/5P2/8/4q3/6k1/8/8/8 b - - 0 1'
    },
    

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Dames', '{RD} vs {rp}', '{p}-Fou en 7e', '{r} du grand côté'],
        title: 'TdB20-4 : Soubirou - Neuhauser (Aix-les Bains, 2009)',
        fen: '8/2P5/3K4/8/1k6/8/8/q7 b - - 0 1'
    },

     {
        path: ['TdB Thématique', 'FINALES', 'Finales de Dames', '{RD} vs {rp}', '{p}-Fou en 7e', '{r} du grand côté'],
        title: 'TdB20-5 : Schlender - Trzaska (Ruhrgebiet, 1997)',
        fen: '8/5P2/5K2/1k6/8/6q1/8/8 b - - 0 1'
    },
    


// -------------------- Finales de Pièces ----------

// ------------------------- RD vs RT ----------

 {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pièces', '{RD} vs {rt}', 'Position de Philidor'],
        title: 'TdB29-5 : F.A.D. Philidor (Analyse du Jeu des Echecs, 1777)',
        fen: '1k6/1r6/2K5/Q7/8/8/8/8 w - - 0 1'
    },
    


// ------------------------- RTF vs RT ----------


 {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pièces', '{RTF} vs {rt}', 'Position de Philidor'],
        title: 'TdB29-6 : F.A.D. Philidor (Analyse du Jeu des Echecs, 1749)',
        fen: '3k4/4r3/3K4/3B4/8/8/8/5R2 w - - 0 1'
    },
    




    
// ---------- ETUDES ----------

// -------------- Finales ----------
// -------------------- Finales de Pions ----------
// -------------------- Finales de Pièces Mineures ----------
// -------------------- Finales de Tours ----------
// -------------------- Finales de Dames ----------
// -------------------- Finales de Pièces ----------
// -------------- Thèmes Tactiques ----------
// -------------- Hors-Séries ----------
 







    {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', 'Pions bloqués'],
        title: 'Ebersz (Magyar Sakkvilag, 1930)',
        fen: '8/1p5k/1P1p4/3p4/3Pp2p/2K1P2p/7P/8 w - - 0 1'
    },

    {
        path: ['TdB Thématique', 'FINALES', 'Finales de Pions', 'Pions bloqués'],
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

   
];
