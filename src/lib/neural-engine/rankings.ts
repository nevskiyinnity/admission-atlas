/**
 * European university rankings (2026 QS Europe Rankings, v1.4).
 *
 * Used by the Neural Engine scoring pipeline to classify a target university
 * into one of four tiers, which drives academic-cap multipliers and
 * differentiation-penalty thresholds.
 *
 * Rank 1–10  → Top 10 Europe
 * Rank 11–30 → Top 30 Europe
 * Rank 31–50 → Top 50 Europe
 * Rank 51+   → Broader Europe
 * Unranked   → Broader Europe (most lenient default)
 */

export interface RankedUniversity {
  rank: number;
  name: string;        // official name (canonical form for display)
  country: string;
  aliases: string[];   // lower-cased alt spellings / abbreviations for fuzzy matching
}

export const EUROPEAN_RANKINGS: RankedUniversity[] = [
  { rank: 1,  name: 'University of Oxford', country: 'United Kingdom', aliases: ['oxford', 'oxford university', 'u of oxford', 'oxbridge'] },
  { rank: 2,  name: 'ETH Zurich', country: 'Switzerland', aliases: ['eth', 'eth zurich', 'eth zürich', 'swiss federal institute of technology zurich'] },
  { rank: 3,  name: 'Imperial College London', country: 'United Kingdom', aliases: ['icl', 'imperial', 'imperial college', 'imperial london'] },
  { rank: 3,  name: 'UCL', country: 'United Kingdom', aliases: ['ucl', 'university college london'] },
  { rank: 5,  name: 'University of Cambridge', country: 'United Kingdom', aliases: ['cambridge', 'cambridge university', 'u of cambridge'] },
  { rank: 6,  name: 'The University of Edinburgh', country: 'United Kingdom', aliases: ['edinburgh', 'university of edinburgh', 'edi'] },
  { rank: 7,  name: "King's College London", country: 'United Kingdom', aliases: ['kcl', "king's college london", 'kings college london', "king's college"] },
  { rank: 8,  name: 'Université PSL', country: 'France', aliases: ['psl', 'universite psl', 'paris sciences et lettres', 'psl university'] },
  { rank: 9,  name: 'The University of Manchester', country: 'United Kingdom', aliases: ['manchester', 'university of manchester', 'uom'] },
  { rank: 10, name: 'EPFL – École polytechnique fédérale de Lausanne', country: 'Switzerland', aliases: ['epfl', 'ecole polytechnique federale de lausanne', 'lausanne'] },
  { rank: 11, name: 'Delft University of Technology', country: 'Netherlands', aliases: ['tu delft', 'delft', 'delft university', 'delft technical university'] },
  { rank: 12, name: 'Lund University', country: 'Sweden', aliases: ['lund', 'lund university'] },
  { rank: 12, name: 'Technical University of Munich', country: 'Germany', aliases: ['tum', 'technical university of munich', 'tu munich', 'tu munchen', 'tu münchen'] },
  { rank: 14, name: 'The London School of Economics and Political Science (LSE)', country: 'United Kingdom', aliases: ['lse', 'london school of economics', 'london school of economics and political science'] },
  { rank: 15, name: 'University of Bristol', country: 'United Kingdom', aliases: ['bristol', 'university of bristol'] },
  { rank: 16, name: 'University of Leeds', country: 'United Kingdom', aliases: ['leeds', 'university of leeds'] },
  { rank: 17, name: 'Ludwig-Maximilians-Universität München', country: 'Germany', aliases: ['lmu', 'lmu munich', 'ludwig maximilians university', 'ludwig-maximilians-universität'] },
  { rank: 17, name: 'The University of Warwick', country: 'United Kingdom', aliases: ['warwick', 'university of warwick'] },
  { rank: 19, name: 'University of Glasgow', country: 'United Kingdom', aliases: ['glasgow', 'university of glasgow'] },
  { rank: 20, name: 'Institut Polytechnique de Paris', country: 'France', aliases: ['ip paris', 'polytechnic institute of paris', 'institut polytechnique de paris'] },
  { rank: 21, name: 'University of Birmingham', country: 'United Kingdom', aliases: ['birmingham', 'university of birmingham', 'uob'] },
  { rank: 22, name: 'Uppsala University', country: 'Sweden', aliases: ['uppsala', 'uppsala university'] },
  { rank: 23, name: 'Universität Heidelberg', country: 'Germany', aliases: ['heidelberg', 'heidelberg university', 'universitat heidelberg'] },
  { rank: 24, name: 'University of Amsterdam', country: 'Netherlands', aliases: ['uva', 'university of amsterdam', 'amsterdam university'] },
  { rank: 25, name: 'University of Nottingham', country: 'United Kingdom', aliases: ['nottingham', 'university of nottingham'] },
  { rank: 26, name: 'KTH Royal Institute of Technology', country: 'Sweden', aliases: ['kth', 'kth royal institute', 'royal institute of technology stockholm'] },
  { rank: 27, name: 'Université Paris-Saclay', country: 'France', aliases: ['paris-saclay', 'paris saclay', 'universite paris-saclay'] },
  { rank: 28, name: 'The University of Sheffield', country: 'United Kingdom', aliases: ['sheffield', 'university of sheffield'] },
  { rank: 29, name: 'Trinity College Dublin, The University of Dublin', country: 'Ireland', aliases: ['trinity college dublin', 'tcd', 'trinity dublin'] },
  { rank: 30, name: 'KU Leuven', country: 'Belgium', aliases: ['ku leuven', 'leuven', 'katholieke universiteit leuven'] },
  { rank: 31, name: 'Sorbonne University', country: 'France', aliases: ['sorbonne', 'sorbonne university', 'sorbonne universite', 'sorbonne université'] },
  { rank: 32, name: 'Durham University', country: 'United Kingdom', aliases: ['durham', 'durham university'] },
  { rank: 33, name: 'University of Southampton', country: 'United Kingdom', aliases: ['southampton', 'university of southampton'] },
  { rank: 34, name: 'University of Zurich', country: 'Switzerland', aliases: ['uzh', 'university of zurich', 'universitat zurich'] },
  { rank: 35, name: 'Aalto University', country: 'Finland', aliases: ['aalto', 'aalto university'] },
  { rank: 36, name: 'Newcastle University', country: 'United Kingdom', aliases: ['newcastle', 'newcastle university'] },
  { rank: 37, name: 'Queen Mary University of London', country: 'United Kingdom', aliases: ['qmul', 'queen mary', 'queen mary university of london'] },
  { rank: 38, name: 'University College Dublin', country: 'Ireland', aliases: ['ucd', 'university college dublin'] },
  { rank: 39, name: 'Freie Universität Berlin', country: 'Germany', aliases: ['fu berlin', 'freie universitat berlin', 'freie universität berlin', 'free university of berlin'] },
  { rank: 40, name: 'University of Vienna', country: 'Austria', aliases: ['university of vienna', 'universitat wien', 'universität wien'] },
  { rank: 41, name: 'Technische Universität Berlin (TU Berlin)', country: 'Germany', aliases: ['tu berlin', 'technische universitat berlin', 'technische universität berlin'] },
  { rank: 42, name: 'Aarhus University', country: 'Denmark', aliases: ['aarhus', 'aarhus university'] },
  { rank: 42, name: 'Ghent University', country: 'Belgium', aliases: ['ghent', 'ghent university', 'universiteit gent'] },
  { rank: 44, name: 'University of St Andrews', country: 'United Kingdom', aliases: ['st andrews', 'saint andrews', 'university of st andrews'] },
  { rank: 45, name: 'Politecnico di Milano', country: 'Italy', aliases: ['polimi', 'politecnico di milano', 'milan polytechnic'] },
  { rank: 45, name: 'University of Copenhagen', country: 'Denmark', aliases: ['copenhagen', 'university of copenhagen', 'kobenhavns universitet', 'københavns universitet'] },
  { rank: 47, name: 'University of Helsinki', country: 'Finland', aliases: ['helsinki', 'university of helsinki'] },
  { rank: 48, name: 'KIT, Karlsruhe Institute of Technology', country: 'Germany', aliases: ['kit', 'karlsruhe institute of technology', 'karlsruher institut für technologie'] },
  { rank: 48, name: 'University of Geneva', country: 'Switzerland', aliases: ['unige', 'university of geneva', 'universite de geneve', 'université de genève'] },
  { rank: 48, name: 'University of Liverpool', country: 'United Kingdom', aliases: ['liverpool', 'university of liverpool'] },
  { rank: 51, name: 'University of Exeter', country: 'United Kingdom', aliases: ['exeter', 'university of exeter'] },
  { rank: 52, name: 'Technical University of Denmark', country: 'Denmark', aliases: ['dtu', 'technical university of denmark'] },
  { rank: 52, name: 'Utrecht University', country: 'Netherlands', aliases: ['utrecht', 'utrecht university', 'universiteit utrecht'] },
  { rank: 54, name: 'RWTH Aachen University', country: 'Germany', aliases: ['rwth', 'rwth aachen', 'aachen university'] },
  { rank: 54, name: 'University of Groningen', country: 'Netherlands', aliases: ['groningen', 'university of groningen'] },
  { rank: 56, name: 'Wageningen University & Research', country: 'Netherlands', aliases: ['wageningen', 'wageningen university'] },
  { rank: 57, name: 'Leiden University', country: 'Netherlands', aliases: ['leiden', 'leiden university'] },
  { rank: 58, name: 'University of Bath', country: 'United Kingdom', aliases: ['bath', 'university of bath'] },
  { rank: 59, name: 'Alma Mater Studiorum – Università di Bologna', country: 'Italy', aliases: ['bologna', 'university of bologna', 'unibo'] },
  { rank: 60, name: 'Universitat de Barcelona', country: 'Spain', aliases: ['ub', 'university of barcelona', 'universitat de barcelona'] },
  { rank: 61, name: 'Erasmus University Rotterdam', country: 'Netherlands', aliases: ['eur', 'erasmus university', 'erasmus rotterdam'] },
  { rank: 62, name: 'Cardiff University', country: 'United Kingdom', aliases: ['cardiff', 'cardiff university'] },
  { rank: 63, name: 'University of York', country: 'United Kingdom', aliases: ['york', 'university of york'] },
  { rank: 64, name: 'University of Oslo', country: 'Norway', aliases: ['oslo', 'university of oslo'] },
  { rank: 65, name: 'Lancaster University', country: 'United Kingdom', aliases: ['lancaster', 'lancaster university'] },
  { rank: 66, name: 'Stockholm University', country: 'Sweden', aliases: ['stockholm university', 'stockholms universitet'] },
  { rank: 66, name: 'Université catholique de Louvain (UCLouvain)', country: 'Belgium', aliases: ['uclouvain', 'universite catholique de louvain'] },
  { rank: 68, name: 'Universitat Autònoma de Barcelona', country: 'Spain', aliases: ['uab', 'autonomous university of barcelona', 'universitat autonoma de barcelona'] },
  { rank: 69, name: 'Rheinische Friedrich-Wilhelms-Universität Bonn', country: 'Germany', aliases: ['university of bonn', 'bonn', 'uni bonn'] },
  { rank: 70, name: "Queen's University Belfast", country: 'United Kingdom', aliases: ['qub', "queen's university belfast", 'queens university belfast'] },
  { rank: 71, name: 'Albert-Ludwigs-Universität Freiburg', country: 'Germany', aliases: ['freiburg', 'university of freiburg', 'albert-ludwigs-universitat freiburg'] },
  { rank: 71, name: 'Universidad Autónoma de Madrid', country: 'Spain', aliases: ['uam', 'autonomous university of madrid'] },
  { rank: 73, name: 'Chalmers University of Technology', country: 'Sweden', aliases: ['chalmers', 'chalmers university'] },
  { rank: 74, name: 'Humboldt-Universität zu Berlin', country: 'Germany', aliases: ['humboldt', 'humboldt university', 'humboldt-universitat zu berlin'] },
  { rank: 75, name: 'University of Gothenburg', country: 'Sweden', aliases: ['gothenburg', 'university of gothenburg', 'goteborgs universitet'] },
  { rank: 76, name: 'University of Reading', country: 'United Kingdom', aliases: ['reading', 'university of reading'] },
  { rank: 77, name: 'Sapienza University of Rome', country: 'Italy', aliases: ['sapienza', 'sapienza university', 'la sapienza', 'university of rome'] },
  { rank: 78, name: 'Complutense University of Madrid', country: 'Spain', aliases: ['ucm', 'complutense', 'complutense university of madrid'] },
  { rank: 79, name: 'Technische Universität Dresden', country: 'Germany', aliases: ['tu dresden', 'dresden', 'technische universitat dresden'] },
  { rank: 80, name: 'Vrije Universiteit Amsterdam', country: 'Netherlands', aliases: ['vu amsterdam', 'vrije universiteit', 'vua'] },
  { rank: 81, name: 'University of Lisbon', country: 'Portugal', aliases: ['lisbon', 'university of lisbon', 'universidade de lisboa'] },
  { rank: 82, name: 'Universität Hamburg', country: 'Germany', aliases: ['hamburg', 'university of hamburg', 'universitat hamburg'] },
  { rank: 83, name: 'University of Göttingen', country: 'Germany', aliases: ['gottingen', 'göttingen', 'university of göttingen', 'university of gottingen'] },
  { rank: 84, name: 'Eindhoven University of Technology', country: 'Netherlands', aliases: ['tu eindhoven', 'tu/e', 'eindhoven'] },
  { rank: 85, name: 'Université libre de Bruxelles', country: 'Belgium', aliases: ['ulb', 'universite libre de bruxelles', 'free university of brussels'] },
  { rank: 86, name: 'Eberhard Karls Universität Tübingen', country: 'Germany', aliases: ['tubingen', 'tübingen', 'university of tubingen'] },
  { rank: 86, name: 'Loughborough University', country: 'United Kingdom', aliases: ['loughborough', 'loughborough university'] },
  { rank: 88, name: 'Maastricht University', country: 'Netherlands', aliases: ['maastricht', 'maastricht university'] },
  { rank: 88, name: 'University of Cologne', country: 'Germany', aliases: ['cologne', 'university of cologne', 'universitat zu koln'] },
  { rank: 90, name: 'University of Lausanne', country: 'Switzerland', aliases: ['unil', 'university of lausanne', 'universite de lausanne'] },
  { rank: 91, name: 'University of Basel', country: 'Switzerland', aliases: ['basel', 'university of basel'] },
  { rank: 92, name: 'Charles University', country: 'Czechia', aliases: ['charles university', 'univerzita karlova'] },
  { rank: 92, name: 'Università di Padova', country: 'Italy', aliases: ['unipd', 'padova', 'university of padua', 'universita di padova'] },
  { rank: 94, name: 'University of Bern', country: 'Switzerland', aliases: ['unibe', 'university of bern', 'universitat bern'] },
  { rank: 95, name: 'University College Cork', country: 'Ireland', aliases: ['ucc', 'university college cork'] },
  { rank: 96, name: 'Norwegian University of Science and Technology', country: 'Norway', aliases: ['ntnu', 'norwegian university of science and technology'] },
  { rank: 97, name: 'University of Strathclyde', country: 'United Kingdom', aliases: ['strathclyde', 'university of strathclyde'] },
  { rank: 98, name: 'University of Galway', country: 'Ireland', aliases: ['university of galway', 'nui galway'] },
  { rank: 99, name: 'Universitat Pompeu Fabra (Barcelona)', country: 'Spain', aliases: ['upf', 'pompeu fabra', 'universitat pompeu fabra'] },
  { rank: 100, name: 'University of Porto', country: 'Portugal', aliases: ['porto', 'university of porto', 'universidade do porto'] },
  { rank: 101, name: 'University of Navarra', country: 'Spain', aliases: ['navarra', 'university of navarra', 'universidad de navarra'] },
  { rank: 102, name: 'University of Aberdeen', country: 'United Kingdom', aliases: ['aberdeen', 'university of aberdeen'] },
  { rank: 103, name: 'Goethe-University Frankfurt Am Main', country: 'Germany', aliases: ['goethe', 'goethe university', 'university of frankfurt'] },
  { rank: 104, name: 'Technische Universität Wien', country: 'Austria', aliases: ['tu wien', 'tu vienna', 'technische universitat wien'] },
  { rank: 105, name: 'University of Bergen', country: 'Norway', aliases: ['uib', 'university of bergen'] },
  { rank: 106, name: 'Radboud University', country: 'Netherlands', aliases: ['radboud', 'radboud university', 'radboud universiteit nijmegen'] },
  { rank: 106, name: 'University of Twente', country: 'Netherlands', aliases: ['ut twente', 'twente', 'university of twente'] },
  { rank: 108, name: 'Swansea University', country: 'United Kingdom', aliases: ['swansea', 'swansea university'] },
  { rank: 109, name: 'University of Antwerp', country: 'Belgium', aliases: ['antwerp', 'university of antwerp'] },
  { rank: 109, name: 'University of Sussex', country: 'United Kingdom', aliases: ['sussex', 'university of sussex'] },
  { rank: 111, name: 'Universidade Nova de Lisboa', country: 'Portugal', aliases: ['nova', 'nova lisbon', 'universidade nova de lisboa'] },
  { rank: 111, name: 'University of Surrey', country: 'United Kingdom', aliases: ['surrey', 'university of surrey'] },
  { rank: 113, name: 'University of Warsaw', country: 'Poland', aliases: ['uw warsaw', 'university of warsaw', 'uniwersytet warszawski'] },
  { rank: 114, name: 'Linköping University', country: 'Sweden', aliases: ['liu', 'linkoping', 'linköping university'] },
  { rank: 114, name: 'University of Milan', country: 'Italy', aliases: ['unimi', 'milan', 'university of milan', 'universita degli studi di milano'] },
  { rank: 116, name: 'Middle East Technical University', country: 'Türkiye', aliases: ['metu', 'middle east technical university', 'odtu'] },
  { rank: 116, name: 'University of Münster', country: 'Germany', aliases: ['munster', 'münster', 'university of munster', 'university of münster'] },
  { rank: 118, name: 'Politecnico di Torino', country: 'Italy', aliases: ['polito', 'politecnico di torino', 'turin polytechnic'] },
  { rank: 119, name: 'Université Paris 1 Panthéon-Sorbonne', country: 'France', aliases: ['pantheon sorbonne', 'paris 1', 'paris 1 pantheon sorbonne'] },
  { rank: 120, name: 'Vrije Universiteit Brussel (VUB)', country: 'Belgium', aliases: ['vub', 'vrije universiteit brussel'] },
  { rank: 121, name: 'Friedrich-Alexander-Universität Erlangen-Nürnberg', country: 'Germany', aliases: ['fau', 'erlangen-nurnberg', 'friedrich alexander university'] },
  { rank: 122, name: 'Universidad Politécnica de Madrid (UPM)', country: 'Spain', aliases: ['upm', 'polytechnic university of madrid'] },
  { rank: 123, name: 'Universidad Carlos III de Madrid (UC3M)', country: 'Spain', aliases: ['uc3m', 'carlos iii madrid', 'universidad carlos iii de madrid'] },
  { rank: 124, name: 'Istanbul Technical University', country: 'Türkiye', aliases: ['itu', 'istanbul technical university'] },
  { rank: 125, name: 'University of Leicester', country: 'United Kingdom', aliases: ['leicester', 'university of leicester'] },
  { rank: 126, name: 'Jagiellonian University', country: 'Poland', aliases: ['jagiellonian', 'uniwersytet jagiellonski'] },
  { rank: 127, name: "City St George's, University of London", country: 'United Kingdom', aliases: ['city university london', "city st george's", 'city university'] },
  { rank: 128, name: 'Heriot-Watt University', country: 'United Kingdom', aliases: ['heriot-watt', 'heriot watt', 'heriot-watt university'] },
  { rank: 129, name: 'University of Southern Denmark (SDU)', country: 'Denmark', aliases: ['sdu', 'university of southern denmark'] },
  { rank: 130, name: 'Université Grenoble Alpes', country: 'France', aliases: ['uga', 'grenoble alpes', 'universite grenoble alpes'] },
  { rank: 131, name: 'Universitat Politècnica de Catalunya (BarcelonaTech/UPC)', country: 'Spain', aliases: ['upc', 'barcelonatech', 'catalonia polytechnic'] },
  { rank: 132, name: 'Dublin City University', country: 'Ireland', aliases: ['dcu', 'dublin city university'] },
  { rank: 133, name: 'Technical University of Darmstadt', country: 'Germany', aliases: ['tu darmstadt', 'technical university of darmstadt'] },
  { rank: 133, name: 'University of Granada', country: 'Spain', aliases: ['ugr', 'university of granada', 'universidad de granada'] },
  { rank: 135, name: 'University of Coimbra', country: 'Portugal', aliases: ['coimbra', 'university of coimbra', 'universidade de coimbra'] },
];

/** 2026 QS Europe ranking tiers driving the scoring pipeline. */
export type EuropeTier = 'top10' | 'top30' | 'top50' | 'broader';

/** Normalize a name for comparison: lowercase, strip diacritics, collapse whitespace. */
export function normalizeName(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolve a user-typed university string to a ranked European university.
 *
 * Matching strategy (in order):
 * 1. Exact normalized alias match
 * 2. Alias prefix/contains match when the typed string is ≥4 chars
 * 3. Contains match against the official name
 *
 * Returns null if no European university matches — the caller should treat
 * this as Broader Europe / Unranked (most lenient treatment).
 */
export function resolveEuropeanUniversity(typed: string): RankedUniversity | null {
  if (!typed || typed.trim().length < 2) return null;
  const q = normalizeName(typed);

  for (const u of EUROPEAN_RANKINGS) {
    if (u.aliases.includes(q)) return u;
    if (normalizeName(u.name) === q) return u;
  }

  if (q.length >= 4) {
    for (const u of EUROPEAN_RANKINGS) {
      for (const alias of u.aliases) {
        if (alias === q || alias.includes(q) || q.includes(alias)) return u;
      }
      if (normalizeName(u.name).includes(q) || q.includes(normalizeName(u.name))) return u;
    }
  }

  return null;
}

/** Map a numeric rank to a tier. Unknown rank → broader. */
export function tierForRank(rank: number | undefined): EuropeTier {
  if (!rank || rank < 1) return 'broader';
  if (rank <= 10) return 'top10';
  if (rank <= 30) return 'top30';
  if (rank <= 50) return 'top50';
  return 'broader';
}

/** Convenience: given a typed name, return the tier. */
export function tierForTarget(typed: string): { tier: EuropeTier; resolved: RankedUniversity | null } {
  const resolved = resolveEuropeanUniversity(typed);
  return { tier: tierForRank(resolved?.rank), resolved };
}

/** First university at or below a given rank, by tier reference (used for expectation gap benchmarks). */
export function benchmarkUniversity(tier: Exclude<EuropeTier, 'broader'>): RankedUniversity {
  const targetRank: Record<Exclude<EuropeTier, 'broader'>, number> = {
    top10: 5,
    top30: 20,
    top50: 40,
  };
  const wanted = targetRank[tier];
  // Find first university whose rank is ≤ wanted.
  return EUROPEAN_RANKINGS.find((u) => u.rank >= wanted) ?? EUROPEAN_RANKINGS[0];
}
