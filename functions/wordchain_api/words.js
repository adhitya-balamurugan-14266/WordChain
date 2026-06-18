'use strict';

// Curated word list organized by starting letter.
// Words marked with * end in hard letters (X, Q, Z, U) which are strategically preferred.
// The AI will always prefer to play words ending in X, Q, Z, or U to challenge the player.

const WORD_LIST = {
  a: [
    'apex', 'annex', 'affix', 'adieux', 'addax', 'anthrax',   // end in X (hard)
    'emu', 'abu',                                               // end in U (hard)
    'azure', 'ablaze',                                         // end in E (easier)
    'able', 'acid', 'aged', 'also', 'area', 'army', 'ache',
    'arch', 'atom', 'aunt', 'axle', 'acre', 'aged', 'aloe',
    'alto', 'amok', 'amen', 'amid', 'ants', 'arch', 'arid',
    'arow', 'ashy', 'avid', 'awry', 'axle', 'aeon', 'agog',
    'agar', 'agog', 'alan', 'alar', 'albs', 'alga', 'alma',
    'alms', 'aloe', 'alow', 'alps', 'also', 'altar', 'amber',
    'amble', 'ample', 'amuse', 'angel', 'anger', 'angle',
    'angry', 'anime', 'ankle', 'annoy', 'anvil', 'apple',
    'apply', 'april', 'apron', 'aptly', 'arbor', 'ardor',
    'arena', 'argue', 'arise', 'armor', 'aroma', 'arose',
    'array', 'arrow', 'arson', 'ashen', 'ashes', 'aside',
    'asked', 'aspen', 'assay', 'asset', 'atlas', 'atone',
    'attic', 'audio', 'audit', 'augur', 'aural', 'avail',
    'avert', 'avoid', 'awake', 'award', 'aware', 'awful',
    'awn', 'axon', 'abbot', 'abbey', 'abide', 'abyss',
    'acorn', 'acrid', 'acted', 'acumen', 'adage', 'adept',
    'admit', 'adobe', 'adopt', 'adorn', 'adrift', 'adult',
    'advent', 'adverb', 'aerial', 'affect', 'afford', 'afloat',
    'afraid', 'agenda', 'agent', 'agile', 'aging', 'agony',
    'agree', 'ahead', 'aided', 'aimed', 'aired', 'aioli',
    'aisle', 'alarm', 'album', 'alert', 'algae', 'alibi',
    'alien', 'align', 'alike', 'alive', 'allay', 'alley',
    'allot', 'allow', 'alloy', 'aloof', 'along', 'aloud'
  ],
  b: [
    'box', 'fox', 'vex', 'hex',  // end in X (harder)
    'blitz', 'bonze',             // end in Z
    'bureau',                     // end in U
    'blob', 'blot', 'blue', 'blur', 'bold', 'bolt', 'bond',
    'bone', 'book', 'boom', 'boot', 'bore', 'born', 'both',
    'bout', 'bowl', 'brag', 'bran', 'brat', 'brew', 'brim',
    'brow', 'buck', 'buff', 'bulb', 'bulk', 'bull', 'bunk',
    'buoy', 'burn', 'burp', 'burr', 'bush', 'busy', 'buzz',
    'beach', 'beard', 'beast', 'began', 'begin', 'below',
    'bench', 'berry', 'beset', 'birch', 'birth', 'bison',
    'black', 'blade', 'blame', 'bland', 'blast', 'blaze',
    'bleak', 'blend', 'bless', 'blimp', 'blind', 'block',
    'blood', 'bloom', 'blown', 'blunt', 'boast', 'board',
    'brace', 'braid', 'brand', 'brave', 'brawl', 'brawn',
    'braid', 'bread', 'break', 'breed', 'bribe', 'bridal',
    'bride', 'brief', 'brine', 'brisk', 'broil', 'broke',
    'brook', 'broom', 'broth', 'brown', 'bruit', 'brunt',
    'brush', 'brute', 'buddy', 'budge', 'built', 'bunny',
    'burly', 'burst', 'bylaw'
  ],
  c: [
    'crux', 'calyx', 'codex', 'comix', 'cervix',  // end in X (hard)
    'quiz',                                         // end in Z
    'chateau',                                      // end in U
    'cafe', 'cage', 'cake', 'calm', 'came', 'camp', 'cane',
    'cape', 'card', 'care', 'carp', 'cart', 'case', 'cash',
    'cast', 'cave', 'ceil', 'cell', 'cent', 'chad', 'chef',
    'chin', 'chip', 'chop', 'chow', 'clam', 'clap', 'claw',
    'clay', 'clip', 'clog', 'clop', 'clot', 'clue', 'coal',
    'coat', 'coil', 'coin', 'cold', 'colt', 'coma', 'come',
    'cone', 'cook', 'cool', 'cope', 'copy', 'cord', 'core',
    'cork', 'corn', 'cost', 'cozy', 'cram', 'crap', 'crew',
    'crib', 'crop', 'crow', 'crud', 'curl', 'curt', 'cyst',
    'cable', 'cadet', 'candy', 'cargo', 'carry', 'catch',
    'cause', 'cedar', 'chain', 'chair', 'chalk', 'champ',
    'chaos', 'chard', 'charm', 'chart', 'chase', 'cheap',
    'cheat', 'cheek', 'cheer', 'chess', 'chest', 'chide',
    'chief', 'child', 'chill', 'choir', 'chord', 'civic',
    'civil', 'claim', 'clasp', 'class', 'clean', 'clear',
    'clerk', 'click', 'cliff', 'climb', 'cling', 'clock',
    'clone', 'close', 'cloth', 'cloud', 'clout', 'clown',
    'comet', 'comic', 'comma', 'count', 'court', 'cover',
    'covet', 'crack', 'craft', 'cramp', 'crane', 'crank',
    'crash', 'crave', 'crawl', 'creak', 'cream', 'creed',
    'crept', 'crest', 'crimp', 'crisp', 'cross', 'crowd',
    'cruel', 'crush', 'crust', 'crypt', 'curly', 'curry',
    'cycle', 'cynic'
  ],
  d: [
    'detox', 'delux', 'duplex',  // end in X (hard)
    'daze', 'ditz',               // end in Z
    'debris', 'debut',            // end in U
    'dab', 'dad', 'dam', 'damp', 'dare', 'dark', 'dart',
    'dash', 'date', 'dawn', 'daze', 'dead', 'deaf', 'deal',
    'dean', 'dear', 'debt', 'deck', 'deep', 'deer', 'deft',
    'dell', 'dent', 'deny', 'dew', 'dice', 'dike', 'dill',
    'dime', 'dine', 'ding', 'dirt', 'disc', 'dish', 'disk',
    'dock', 'does', 'doff', 'dolt', 'dome', 'done', 'dong',
    'dope', 'dork', 'dorm', 'dose', 'dote', 'dove', 'down',
    'drag', 'drip', 'drop', 'drum', 'dual', 'duel', 'dug',
    'dull', 'duly', 'dump', 'dung', 'dusk', 'dust', 'duty',
    'daisy', 'dance', 'datum', 'decal', 'decoy', 'deduce',
    'delta', 'depot', 'depth', 'derby', 'drift', 'drive',
    'drone', 'drove', 'drown', 'druid', 'drunk', 'drupe',
    'dunce', 'dwarf', 'dwell', 'dwelt', 'dying'
  ],
  e: [
    'eaux',  // end in X (hard, plural of eau)
    'equip',
    'ebony', 'eerie', 'eight', 'eject', 'elect', 'elegy',
    'elite', 'ember', 'emery', 'emote', 'empty', 'endow',
    'enjoy', 'ensue', 'enter', 'envoy', 'epoch', 'equip',
    'erode', 'essay', 'ethic', 'evade', 'event', 'every',
    'evict', 'exact', 'exalt', 'exert', 'exile', 'exist',
    'expel', 'expound', 'extol', 'exude', 'eagle', 'early',
    'earth', 'easel', 'eaten', 'ebbed', 'eclat', 'egged',
    'egret', 'elder', 'elfin', 'elide', 'emend', 'ether',
    'evoke', 'exert', 'exile', 'extra'
  ],
  f: [
    'flex', 'flux', 'flax', 'ibex',  // end in X (hard)
    'fizz', 'fuzz',                   // end in Z
    'fondue',                          // end in U
    'face', 'fact', 'fade', 'fail', 'fair', 'fall', 'fame',
    'fare', 'farm', 'fast', 'fate', 'fawn', 'faze', 'fear',
    'feat', 'feel', 'feet', 'felt', 'fend', 'fern', 'fern',
    'fest', 'fife', 'fill', 'film', 'find', 'fine', 'firm',
    'fish', 'fist', 'flag', 'flap', 'flat', 'flaw', 'flea',
    'fled', 'flew', 'flip', 'flop', 'flow', 'foam', 'fold',
    'folk', 'fond', 'font', 'food', 'fool', 'ford', 'fore',
    'fork', 'form', 'fort', 'foul', 'fowl', 'fray', 'free',
    'fret', 'frog', 'from', 'fume', 'fund', 'fury', 'fuse',
    'fawn', 'fable', 'facet', 'faith', 'false', 'fault',
    'feast', 'fetch', 'fever', 'fewer', 'fiber', 'field',
    'fiend', 'fiery', 'fifth', 'fifty', 'fight', 'finch',
    'first', 'fixed', 'fjord', 'flail', 'flake', 'flame',
    'flank', 'flare', 'flash', 'flask', 'flair', 'fleck',
    'fleet', 'flesh', 'flock', 'flood', 'floor', 'floss',
    'flour', 'flout', 'flown', 'fluff', 'fluid', 'flunk',
    'flute', 'focal', 'focus', 'force', 'forge', 'forth',
    'found', 'frail', 'franc', 'frank', 'fraud', 'freak',
    'fresh', 'friar', 'frill', 'frisk', 'fritz', 'front',
    'frost', 'frown', 'froze', 'frugal', 'fully', 'fungi',
    'furry', 'fuzzy'
  ],
  g: [
    'grex',  // end in X
    'gauze', 'glaze', 'graze',  // end in E
    'gateau', 'bayou',           // end in U
    'gab', 'gag', 'gap', 'gas', 'gel', 'gem', 'gig', 'gin',
    'gnu', 'gob', 'god', 'goo', 'got', 'gum', 'gun', 'gust',
    'gale', 'game', 'gang', 'gape', 'garb', 'gash', 'gasp',
    'gate', 'gave', 'gaze', 'gear', 'gild', 'gist', 'give',
    'glad', 'glee', 'glen', 'glib', 'glob', 'glow', 'glue',
    'glum', 'glyph', 'goad', 'goal', 'goat', 'gold', 'gone',
    'good', 'gore', 'gory', 'gown', 'grab', 'grad', 'gram',
    'gran', 'grate', 'gray', 'grew', 'grid', 'grim', 'grin',
    'grip', 'grit', 'grub', 'gull', 'gulp', 'gunk', 'guru',
    'gust', 'garlic', 'gauge', 'gauze', 'ghost', 'giant',
    'giddy', 'given', 'gland', 'glare', 'gleam', 'glean',
    'glide', 'glint', 'gloat', 'gloom', 'gloss', 'glove',
    'glower', 'gnash', 'goner', 'goose', 'gorge', 'gouge',
    'grace', 'grade', 'grain', 'grand', 'grant', 'grape',
    'grasp', 'grass', 'grate', 'grave', 'gravel', 'great',
    'greed', 'green', 'greet', 'grief', 'grieve', 'grill',
    'gripe', 'groan', 'groin', 'grope', 'gross', 'grout',
    'grove', 'growl', 'grown', 'gruel', 'gruff', 'grunt',
    'guile', 'guise', 'gulch', 'gusto', 'gusty'
  ],
  h: [
    'hoax', 'helix', 'hymnbook',  // end in X
    'hertz',                       // end in Z
    'bayou', 'haiku',              // end in U
    'hack', 'hail', 'hall', 'halt', 'hand', 'hang', 'hard',
    'hare', 'harm', 'harp', 'hash', 'haul', 'have', 'haze',
    'head', 'heal', 'heap', 'heat', 'heel', 'helm', 'help',
    'herb', 'here', 'herd', 'hill', 'hilt', 'hint', 'hire',
    'hive', 'hold', 'hole', 'holt', 'home', 'hone', 'hood',
    'hook', 'hoop', 'hope', 'horn', 'hose', 'host', 'hour',
    'huge', 'hull', 'hump', 'hunt', 'hurl', 'hurt', 'husk',
    'habit', 'happy', 'harsh', 'haste', 'haven', 'hazel',
    'heart', 'heavy', 'hedge', 'heist', 'hence', 'heron',
    'hinge', 'hippo', 'hoist', 'holly', 'homer', 'honey',
    'honor', 'hornet', 'horse', 'hotel', 'hound', 'house',
    'human', 'humid', 'humor', 'hunch', 'husky', 'hydra',
    'hyena', 'hyper', 'hypothetical'
  ],
  i: [
    'ibex', 'index',     // end in X (hard)
    'iglu',              // end in U
    'iced', 'idea', 'idol', 'inch', 'into', 'iris', 'iron',
    'isle', 'itch', 'ivory', 'image', 'imply', 'inert',
    'inlet', 'inner', 'input', 'inter', 'intro', 'inure',
    'issue', 'ivory', 'ideal', 'idiot', 'inept', 'infer',
    'ingot', 'inner', 'irate', 'irons'
  ],
  j: [
    'jinx',               // end in X (hard)
    'jazz', 'jeez',       // end in Z (hard)
    'jabot', 'bijou',     // end in U
    'jab', 'jam', 'jot', 'joy', 'jug', 'jut', 'jail',
    'jake', 'jape', 'jell', 'jest', 'jibe', 'jilt', 'jimp',
    'jink', 'jive', 'joust', 'jade', 'join', 'joke', 'jolt',
    'jostle', 'joule', 'judge', 'juice', 'juicy', 'jumbo',
    'jumpy', 'junior', 'junta', 'juror'
  ],
  k: [
    'kludge', 'klutz',   // end in Z
    'kaiku', 'haiku',    // end in U
    'keen', 'kept', 'kern', 'kill', 'kind', 'king', 'knit',
    'knob', 'knot', 'know', 'kale', 'kelp', 'kemp', 'kiln',
    'kilt', 'knave', 'kneel', 'knife', 'knoll', 'known',
    'koala', 'kudos'
  ],
  l: [
    'lynx', 'lex',        // end in X (hard)
    'laze', 'laze',       // end in Z (easy)
    'lieu', 'luau',       // end in U (hard)
    'lab', 'lad', 'lag', 'lap', 'law', 'lax', 'lay', 'lea',
    'led', 'leg', 'lid', 'lip', 'log', 'lot', 'low', 'lug',
    'lace', 'lack', 'lake', 'lame', 'lamp', 'land', 'lane',
    'lard', 'lark', 'lash', 'last', 'late', 'lawn', 'leak',
    'lean', 'leap', 'lend', 'lent', 'lens', 'lien', 'life',
    'lift', 'like', 'limb', 'lime', 'limp', 'line', 'lint',
    'lion', 'list', 'live', 'load', 'loam', 'loan', 'lock',
    'loft', 'lone', 'long', 'loom', 'loop', 'lore', 'lorn',
    'loft', 'lush', 'lute', 'label', 'lapse', 'large', 'laser',
    'latch', 'layer', 'leach', 'leaky', 'learn', 'lease',
    'leash', 'least', 'leave', 'ledge', 'legal', 'lemon',
    'level', 'lever', 'light', 'limit', 'linen', 'liner',
    'liver', 'local', 'lodge', 'logic', 'loose', 'lover',
    'lower', 'loyal', 'lucid', 'lucky', 'lumpy', 'lunar',
    'lunch', 'lusty', 'lying'
  ],
  m: [
    'minx', 'matrix',     // end in X (hard)
    'waltz', 'ritz',      // end in Z
    'milieu', 'bayou',    // end in U (hard)
    'mad', 'man', 'map', 'mat', 'maw', 'mid', 'mix', 'mob',
    'mod', 'mop', 'mud', 'mug', 'mull', 'mace', 'made', 'mail',
    'main', 'make', 'male', 'mall', 'malt', 'mane', 'many',
    'mark', 'mars', 'mash', 'mask', 'mast', 'mate', 'maze',
    'meal', 'mean', 'meat', 'meet', 'melt', 'memo', 'menu',
    'mesh', 'mile', 'milk', 'mill', 'mime', 'mind', 'mine',
    'mint', 'mire', 'mist', 'moan', 'moat', 'mock', 'mold',
    'mole', 'molt', 'monk', 'moor', 'moot', 'more', 'moss',
    'moth', 'move', 'muck', 'muds', 'mule', 'musk', 'must',
    'mayor', 'merit', 'merry', 'midst', 'might', 'mimic',
    'manor', 'maple', 'march', 'marsh', 'mocha', 'model',
    'money', 'month', 'moral', 'moron', 'mossy', 'motor',
    'mourn', 'mouse', 'mouth', 'muddy', 'mulch', 'music',
    'musty', 'myrrh', 'metal', 'meter', 'moldy', 'mound',
    'mount', 'melon', 'mercy', 'miter', 'mixed', 'mixer'
  ],
  n: [
    'lynx',         // end in X
    'ritz',         // end in Z
    'bayou',        // end in U
    'nab', 'nag', 'nap', 'nil', 'nip', 'nit', 'nob', 'nod',
    'nor', 'not', 'nun', 'nut', 'name', 'nape', 'neck', 'need',
    'nest', 'newt', 'nice', 'nick', 'nil', 'nine', 'node',
    'none', 'nook', 'noon', 'norm', 'nose', 'note', 'nude',
    'null', 'numb', 'ninja', 'niece', 'night', 'noble', 'noise',
    'notch', 'nourish', 'novel', 'nudge', 'nurse', 'nymph',
    'nasal', 'naval', 'nerve', 'never', 'nexus', 'night',
    'nimble', 'noble', 'nonce', 'noose', 'north', 'noted',
    'novel', 'nugget', 'nutty'
  ],
  o: [
    'onyx',          // end in X (hard)
    'quiz', 'oz',    // end in Z
    'bayou',         // end in U
    'oak', 'oar', 'odd', 'ode', 'off', 'old', 'one', 'orb',
    'ore', 'our', 'owl', 'own', 'oath', 'oboe', 'omen',
    'once', 'only', 'ooze', 'open', 'oral', 'orca', 'ogre',
    'ogle', 'olive', 'opal', 'orbit', 'order', 'other', 'outer',
    'ovary', 'ovoid', 'oxide', 'oxen', 'ozone', 'onset', 'ocean',
    'opaque', 'optic', 'ovate', 'owing', 'owned'
  ],
  p: [
    'phlox', 'protax',  // end in X (hard)
    'pizzazz',          // end in Z (hard)
    'plateau', 'plateaux', 'purview',  // end in U
    'pad', 'pan', 'pap', 'par', 'pat', 'paw', 'pay', 'pea',
    'peg', 'pen', 'pet', 'pie', 'pig', 'pin', 'pit', 'pod',
    'pop', 'pot', 'pow', 'pry', 'pub', 'pug', 'pun', 'pus',
    'pace', 'pack', 'page', 'paid', 'pain', 'pair', 'pale',
    'pall', 'palm', 'pane', 'park', 'pave', 'pawn', 'peak',
    'peal', 'pear', 'peel', 'pelt', 'pend', 'perk', 'pest',
    'pick', 'pier', 'pile', 'pill', 'pine', 'ping', 'pipe',
    'plan', 'play', 'plot', 'plow', 'plug', 'plum', 'plus',
    'poem', 'poll', 'polo', 'pond', 'pool', 'poop', 'pore',
    'port', 'pose', 'post', 'pour', 'prey', 'prod', 'prop',
    'pull', 'pulp', 'pump', 'punk', 'pure', 'purl', 'push',
    'pale', 'panel', 'panic', 'paper', 'party', 'pasta', 'paste',
    'patch', 'pause', 'peace', 'pearl', 'penal', 'penny', 'peril',
    'perky', 'perch', 'petty', 'phase', 'phone', 'photo', 'piano',
    'pilot', 'pinch', 'pitch', 'pivot', 'pixel', 'pizza', 'place',
    'plaid', 'plain', 'plane', 'plank', 'plant', 'plate', 'plaza',
    'plead', 'plumb', 'plume', 'plump', 'plunk', 'plush', 'point',
    'poise', 'polar', 'polio', 'polka', 'poppy', 'porch', 'pound',
    'power', 'prank', 'press', 'price', 'pride', 'prime', 'print',
    'prior', 'prism', 'prize', 'probe', 'prone', 'proof', 'prose',
    'proud', 'prove', 'prowl', 'prune', 'psalm', 'pubic', 'pudgy',
    'puffy', 'pulpy', 'pulse', 'purse', 'pushy', 'pygmy'
  ],
  q: [
    'quartz',  // end in Z (hard)
    'queue',   // end in E
    'quad', 'quay', 'quiz',
    'quaff', 'qualm', 'qualm', 'quandary', 'quarrel', 'quartz',
    'quasar', 'quasi', 'queen', 'quell', 'query', 'quick',
    'quiet', 'quirk', 'quota', 'quote'
  ],
  r: [
    'radix', 'redux', 'reflex',    // end in X (hard)
    'ritz', 'razz',                 // end in Z (hard)
    'ragout', 'rendezvous',         // end in U
    'ram', 'ran', 'rap', 'rat', 'raw', 'ray', 'rid', 'rig',
    'rip', 'rob', 'rod', 'rot', 'row', 'rub', 'rug', 'rum',
    'rut', 'rye', 'race', 'rack', 'rage', 'rail', 'rain',
    'rake', 'ramp', 'rank', 'rant', 'rash', 'rasp', 'rate',
    'rave', 'raze', 'read', 'real', 'reap', 'reed', 'reel',
    'rein', 'rent', 'rest', 'ride', 'rife', 'rift', 'ring',
    'rink', 'rise', 'risk', 'rite', 'road', 'roam', 'roar',
    'robe', 'rock', 'rogue', 'role', 'roll', 'roof', 'room',
    'root', 'rope', 'rose', 'rosy', 'rove', 'rude', 'ruin',
    'rule', 'rush', 'rust', 'rabid', 'radar', 'radio', 'rainy',
    'raise', 'rally', 'range', 'rapid', 'reach', 'realm', 'rebel',
    'reign', 'relax', 'relay', 'relic', 'repay', 'repel', 'rider',
    'rifle', 'right', 'rigor', 'risky', 'rival', 'rivet', 'river',
    'robin', 'robot', 'rocky', 'roman', 'roomy', 'rouge', 'rough',
    'round', 'rouse', 'royal', 'rugby', 'ruler', 'runny', 'rural',
    'rusty', 'rabble', 'racket', 'radius', 'random', 'raucous',
    'ragged', 'ragged', 'rafter', 'raging', 'rammed', 'rampage',
    'rampart', 'random', 'rattle', 'ravage', 'raven', 'ravine',
    'reason', 'recall', 'recent', 'recipe', 'recite', 'recoil',
    'record', 'reduce', 'refine', 'reform', 'refuel', 'refuse',
    'regent', 'rejoin', 'relate', 'relief', 'remain', 'remark',
    'remedy', 'remit', 'remote', 'rental', 'report', 'rescue',
    'resist', 'result', 'retain', 'reveal', 'review', 'revolt',
    'reward', 'rewind', 'rhythm', 'riddle', 'ritual', 'robust',
    'rocket', 'roster', 'rotate', 'rubber', 'rubble', 'ruckus'
  ],
  s: [
    'suffix', 'sphinx', 'syntax', 'systax',  // end in X (hard)
    'ritz', 'ritz', 'quartz', 'schmaltz', 'spitz',  // end in Z (hard)
    'sinew', 'snafu',                                 // end in U
    'sac', 'sad', 'sag', 'sap', 'sat', 'saw', 'say', 'sea',
    'set', 'sew', 'shy', 'sin', 'sip', 'sit', 'ski', 'sob',
    'sod', 'son', 'sop', 'sow', 'soy', 'spa', 'spy', 'sty',
    'sub', 'sue', 'sum', 'sun', 'sup', 'safe', 'sage', 'sake',
    'sale', 'salt', 'same', 'sand', 'sane', 'sang', 'sank',
    'sash', 'save', 'scab', 'scan', 'scar', 'scow', 'seam',
    'sear', 'seat', 'seed', 'seek', 'seem', 'seep', 'seer',
    'self', 'send', 'sent', 'serf', 'shed', 'shin', 'ship',
    'shop', 'shot', 'show', 'shut', 'sick', 'side', 'sigh',
    'silk', 'sill', 'silo', 'silt', 'sine', 'sink', 'site',
    'size', 'skid', 'skim', 'skin', 'skip', 'slab', 'slam',
    'slap', 'slat', 'slaw', 'sled', 'slew', 'slid', 'slim',
    'slip', 'slit', 'slob', 'sloe', 'slog', 'slop', 'slot',
    'slow', 'slug', 'slum', 'slur', 'smear', 'smog', 'smug',
    'snag', 'snap', 'snob', 'snug', 'soak', 'soap', 'soar',
    'sock', 'soft', 'soil', 'sold', 'sole', 'some', 'song',
    'soot', 'sore', 'sort', 'soul', 'sour', 'span', 'spar',
    'spat', 'spec', 'sped', 'spin', 'spit', 'spot', 'spun',
    'spur', 'stab', 'star', 'stay', 'stem', 'step', 'stew',
    'stir', 'stop', 'stub', 'stud', 'stun', 'such', 'suit',
    'sulk', 'surf', 'swam', 'swan', 'swap', 'swat', 'sway',
    'swim', 'swot', 'salon', 'sauce', 'scale', 'scald', 'scalp',
    'scamp', 'scant', 'scary', 'scene', 'scone', 'score', 'scorn',
    'scout', 'scram', 'scrap', 'scrawl', 'screw', 'scrub', 'seize',
    'sense', 'serum', 'serve', 'seven', 'shade', 'shaft', 'shale',
    'shame', 'shape', 'share', 'shark', 'sharp', 'shave', 'shawl',
    'shear', 'sheen', 'sheer', 'shelf', 'shell', 'shift', 'shine',
    'shiny', 'shire', 'shirt', 'shock', 'shore', 'short', 'shout',
    'shove', 'shrub', 'shrug', 'shuck', 'sigma', 'silly', 'since',
    'sinew', 'sixth', 'sixty', 'skate', 'skill', 'skull', 'skunk',
    'slate', 'slave', 'sleep', 'sleet', 'slept', 'slice', 'slide',
    'slope', 'sloth', 'small', 'smart', 'smell', 'smile', 'smite',
    'smoke', 'snail', 'snake', 'snare', 'sneak', 'sniff', 'snore',
    'snort', 'solar', 'solid', 'solve', 'sonic', 'sound', 'south',
    'space', 'spade', 'spare', 'spark', 'spawn', 'spear', 'speed',
    'spell', 'spend', 'spice', 'spill', 'spine', 'spiral', 'split',
    'spoke', 'spore', 'sport', 'spray', 'spree', 'squad', 'squat',
    'stain', 'stale', 'stalk', 'stall', 'stamp', 'stand', 'stare',
    'stark', 'start', 'stash', 'state', 'stave', 'steak', 'steal',
    'steam', 'steel', 'steep', 'steer', 'stern', 'stiff', 'still',
    'sting', 'stock', 'stoic', 'stomp', 'stone', 'stood', 'stoop',
    'store', 'storm', 'story', 'stove', 'strap', 'straw', 'stray',
    'strip', 'strode', 'stone', 'stuff', 'stump', 'stung', 'stunk',
    'stunt', 'style', 'suede', 'sugar', 'suite', 'sulky', 'sunny',
    'super', 'surge', 'swamp', 'swear', 'sweat', 'sweep', 'sweet',
    'swept', 'swift', 'swill', 'swine', 'swing', 'swipe', 'swirl',
    'swoop', 'sword', 'swore', 'sworn'
  ],
  t: [
    'thorax', 'tux',        // end in X (hard)
    'topaz', 'tzar',        // end in Z (hard)
    'tofu', 'tableau',      // end in U
    'tab', 'tag', 'tan', 'tap', 'tar', 'tax', 'ten', 'the',
    'tie', 'tin', 'tip', 'toe', 'ton', 'too', 'top', 'toy',
    'try', 'tub', 'tug', 'tun', 'tale', 'tall', 'tame', 'tank',
    'tare', 'tarn', 'tarp', 'task', 'taut', 'teal', 'teem',
    'tell', 'tend', 'tent', 'term', 'tern', 'text', 'thaw',
    'them', 'then', 'they', 'thin', 'this', 'thou', 'thud',
    'thug', 'thus', 'tick', 'tide', 'tier', 'tile', 'till',
    'tilt', 'time', 'tire', 'toil', 'toll', 'tomb', 'tome',
    'tone', 'tong', 'took', 'tool', 'tore', 'torn', 'toss',
    'tour', 'town', 'tram', 'trap', 'trek', 'trim', 'trip',
    'trod', 'trot', 'troy', 'true', 'tube', 'tuck', 'tuft',
    'tuna', 'tune', 'turf', 'tusk', 'twin', 'twit', 'tact',
    'talon', 'tabby', 'taste', 'taunt', 'tawny', 'teach', 'tease',
    'teddy', 'teeth', 'tense', 'tepid', 'thick', 'thorn', 'those',
    'three', 'threw', 'throw', 'thumb', 'thump', 'tiara', 'tiger',
    'tidal', 'tight', 'tinge', 'tired', 'titan', 'title', 'toadstool',
    'toast', 'token', 'torso', 'total', 'touch', 'tough', 'toxin',
    'trace', 'track', 'trade', 'trail', 'train', 'trait', 'tramp',
    'trash', 'trawl', 'triad', 'trial', 'tribe', 'trick', 'tricky',
    'tried', 'trill', 'tripe', 'troop', 'troth', 'trout', 'trove',
    'truck', 'trump', 'trunk', 'trust', 'truth', 'tuber', 'tumor',
    'tuner', 'turbo', 'twice', 'twist', 'tying'
  ],
  u: [
    'unbox', 'unix',         // end in X (hard)
    'unhappy', 'unwary',     // end in Y
    'ugly', 'undo', 'unit', 'upon', 'urge', 'used', 'user',
    'ulcer', 'ultra', 'unfit', 'union', 'unity', 'untie',
    'undue', 'upper', 'upset', 'urban', 'usher', 'utter'
  ],
  v: [
    'vex', 'vertex', 'vortex', 'vieux',  // end in X (hard)
    'vibe', 'vine', 'vale', 'vane', 'vase', 'vast', 'veal',
    'veil', 'vein', 'vent', 'verb', 'very', 'vest', 'veto',
    'vial', 'vice', 'void', 'vole', 'volt', 'vote', 'vow',
    'valid', 'valor', 'value', 'valve', 'vapor', 'vault', 'vicar',
    'video', 'vigor', 'villa', 'vinyl', 'viola', 'viral', 'virus',
    'visor', 'vital', 'vivid', 'vocal', 'vodka', 'voila', 'vogue',
    'voice', 'vouch', 'voila', 'verse', 'visit', 'vista', 'vital',
    'vivid', 'vicar', 'vigor', 'villa', 'viper', 'voter', 'vowed'
  ],
  w: [
    'waltz', 'whiz',     // end in Z (hard)
    'weird', 'warp', 'wane', 'wade', 'wake', 'walk', 'wall',
    'ward', 'ware', 'warm', 'warn', 'wart', 'wary', 'wash',
    'wasp', 'wave', 'weak', 'weal', 'wean', 'wear', 'weld',
    'well', 'welt', 'wend', 'went', 'were', 'whet', 'whim',
    'whip', 'whit', 'wide', 'wife', 'wild', 'wile', 'will',
    'wilt', 'wink', 'wire', 'wise', 'wish', 'wisp', 'with',
    'woke', 'wolf', 'womb', 'wont', 'wood', 'woof', 'wool',
    'word', 'wore', 'work', 'worm', 'wort', 'wove', 'wrap',
    'wren', 'writ', 'wrath', 'wreck', 'wring', 'write', 'wagon',
    'waist', 'water', 'weary', 'weave', 'weeds', 'weigh', 'welch',
    'whale', 'wharf', 'wheat', 'wheel', 'where', 'which', 'while',
    'white', 'whole', 'whose', 'widen', 'widow', 'witch', 'woman',
    'wombs', 'world', 'worry', 'worst', 'worth', 'would', 'wound',
    'wrist', 'wrong', 'wrung'
  ],
  x: [
    'xenon',   // starts with x
    'xeric'
  ],
  y: [
    'yoga', 'yoke', 'yore', 'your', 'yawn', 'yard', 'yarn',
    'year', 'yearn', 'yeast', 'yield', 'young', 'youth', 'yummy'
  ],
  z: [
    'zeal', 'zero', 'zest', 'zinc', 'zone', 'zoom', 'zany',
    'zebra', 'zilch', 'zipper', 'zombie', 'zenith'
  ]
};

// Hard letters the AI prefers words to end in (to challenge the player)
// Difficulty tiers: determined by how many English words start with each letter.
// Easy endings  → player can easily find a response word
// Very hard ends → very few words start with Q or Z, maximum pressure
const EASY_ENDINGS      = new Set(['a', 'd', 'e', 'i', 'l', 'n', 'o', 'r', 's', 't']);
const MEDIUM_ENDINGS    = new Set(['b', 'c', 'g', 'h', 'm', 'p', 'u', 'y']);
const HARD_ENDINGS      = new Set(['f', 'j', 'k', 'v', 'w', 'x']);
const VERY_HARD_ENDINGS = new Set(['q', 'z']);

/**
 * Pick an AI word starting with `letter`, not in `usedWords`.
 * Difficulty scales with `round`:
 *  Rounds  1– 5 → prefer easy endings   (A D E I L N O R S T)
 *  Rounds  6–10 → prefer medium endings  (B C G H M P U Y)
 *  Rounds 11–15 → prefer hard endings    (F J K V W X)
 *  Rounds  16+  → prefer very hard ends  (Q Z)
 * Falls back through tiers when no preferred word is found.
 * Returns null if the AI has no valid moves (player wins).
 */
function pickAIWord(letter, usedWords, round) {
  const r = (round && round > 0) ? round : 1;
  const candidates = WORD_LIST[letter.toLowerCase()] || [];
  const usedSet = new Set(usedWords.map((w) => w.toLowerCase()));

  const available = candidates.filter(
    (w) => w.length >= 3 && !usedSet.has(w.toLowerCase())
  );

  if (available.length === 0) return null;

  function pickFrom(endings) {
    const filtered = available.filter((w) => endings.has(w[w.length - 1].toLowerCase()));
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  let chosen = null;
  if (r <= 5) {
    chosen = pickFrom(EASY_ENDINGS) || pickFrom(MEDIUM_ENDINGS) || pickFrom(HARD_ENDINGS) || pickFrom(VERY_HARD_ENDINGS);
  } else if (r <= 10) {
    chosen = pickFrom(MEDIUM_ENDINGS) || pickFrom(EASY_ENDINGS) || pickFrom(HARD_ENDINGS) || pickFrom(VERY_HARD_ENDINGS);
  } else if (r <= 15) {
    chosen = pickFrom(HARD_ENDINGS) || pickFrom(VERY_HARD_ENDINGS) || pickFrom(MEDIUM_ENDINGS) || pickFrom(EASY_ENDINGS);
  } else {
    chosen = pickFrom(VERY_HARD_ENDINGS) || pickFrom(HARD_ENDINGS) || pickFrom(MEDIUM_ENDINGS) || pickFrom(EASY_ENDINGS);
  }

  return chosen || available[Math.floor(Math.random() * available.length)];
}

/**
 * Check if a word exists in our known word list (fast local check).
 * Returns true if found locally; caller must still verify with dictionary API for unknowns.
 */
function isInWordList(word) {
  const lower = word.toLowerCase();
  const firstLetter = lower[0];
  const list = WORD_LIST[firstLetter] || [];
  return list.some((w) => w.toLowerCase() === lower);
}

module.exports = { pickAIWord, isInWordList, WORD_LIST };
