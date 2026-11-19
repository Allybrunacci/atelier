/* Atelier — term plans: focuses with their lessons, warm-ups, sharing ideas, running sheets, and three plan styles */
'use strict';

const WARMUPS = [
  ['Blind contour of your hand', 'Draw your other hand for two minutes without looking at the paper. The wobbly results train your eyes to really look.'],
  ['Pressure ladder', 'Make ten boxes from the lightest to the darkest mark your pencil can make.'],
  ['Loose lines', 'Fill a page with straight lines, curves, spirals and zigzags, moving from the shoulder, not the wrist.'],
  ['Quick gestures', 'Draw classmates or photos in 30-second poses, catching the line of action first.'],
  ['Shape spotting', 'Draw an object in three minutes using only circles, boxes and cylinders.'],
  ['Squiggle swap', 'Draw a squiggle, swap with a partner and turn theirs into something.'],
  ['Value thumbnails', 'Make three stamp-sized sketches of the setup using only three values.'],
  ['Ellipse rows', 'Draw a row of ellipses through a centre line, from very thin to almost round.'],
  ['Green race', 'Mix as many different greens as you can in five minutes.'],
  ['Upside-down copy', 'Copy a simple line drawing turned upside down for five minutes.'],
  ['One-line drawing', 'Draw an object without lifting the pen from the paper.'],
  ['Texture rubbings', 'Make crayon rubbings of five different surfaces in the room.'],
  ['Breathing lines', 'Draw a line rising as you breathe in and falling as you breathe out, for one minute.'],
  ['Hatch ladder', 'Hatch five boxes from light to dark using only the spacing of the lines.'],
  ['Negative space chair', 'Draw only the spaces between the legs and rails of a chair.'],
  ['Colour drops', 'Wet a square, drop in two colours and watch how they mix on their own.'],
  ['Memory drawing', 'Look at an object for one minute, hide it, then draw it from memory.'],
  ['Other hand', 'Draw a simple object with your non-drawing hand. Wobbly lines welcome.'],
];
const SHARES = [
  'Gallery walk: lay the work out and everyone names one thing they like in someone else’s piece.',
  'Glow and grow: each student names one thing that worked and one thing to try next time.',
  'Squint test: step back, squint, and check the darks and lights read clearly from a distance.',
  'Pair share: swap with a partner and ask one question about their choices.',
  'Photo and tidy: photograph each piece for the class record while everyone packs up.',
  'Before and after: compare today’s piece with the warm-up and spot what improved.',
];

const FOCUS = [
  { id: 'shading', n: 'Shading techniques', d: 'A different way to build tone each week: hatching, cross-hatching, stippling, scribble, blending, charcoal and ink wash.', mix: ['charcoal', 'ink', 'fundamentals'],
    project: ['A fully shaded still life', ['Choose three objects, light them with a lamp and make thumbnail sketches', 'A measured line drawing of the set-up', 'Map the shadow shapes and the darkest darks', 'Build the mid-tones in your chosen technique', 'Cast shadows, reflected light and textures', 'Highlights, edges and a final push of contrast']],
    lessons: [
      { t: 'Value scales and pencil grades', tech: ['value-scale', 'graphite'], make: 'A nine-step value scale, then a cube shaded with just three of those values (light top, middle side, dark side).', w: 1 },
      { t: 'Light on form: the sphere', tech: ['light-form'], make: 'Shade a sphere under a lamp showing highlight, light, core shadow, reflected light and cast shadow.', w: 6 },
      { t: 'Hatching', tech: ['hatching'], make: 'Shade an apple or pear using only hatched lines: darker means closer together.', w: 13 },
      { t: 'Cross-hatching', tech: ['cross-hatching'], make: 'Build a mug or a jar in up to four layers of cross-hatching, keeping the highlights clean.', w: 13 },
      { t: 'Contour hatching', tech: ['contour-hatching'], make: 'Draw a banana, shell or tree trunk with curved hatching that wraps around the form.', w: 7 },
      { t: 'Stippling', tech: ['stippling'], make: 'Stipple a small subject in fineliner, such as a pine cone, mushroom or shell.', w: 1 },
      { t: 'Scribble and circulism', tech: ['circulism'], make: 'Shade an egg or a smooth stone with tiny overlapping circles for a soft, even finish.', w: 2 },
      { t: 'Blending and smooth gradients', tech: ['blending'], make: 'Render a marble, a spoon or a glass bauble with smooth blends and sharp highlights.', w: 6 },
      { t: 'Charcoal: working from dark to light', tech: ['subtractive', 'charcoal'], make: 'Tone the page with charcoal and lift out the lights of a simple still life with an eraser.', w: 6 },
      { t: 'Cast shadows', tech: ['cast-shadows'], make: 'Light two objects with a lamp and draw their cast shadows, with hard edges near and soft edges far.', w: 4 },
      { t: 'Ink wash', tech: ['ink-wash'], make: 'Paint a three-value ink wash study of a cup and a piece of fruit.', w: 15 },
      { t: 'Shading sampler', tech: ['hatching', 'stippling', 'blending'], make: 'Shade the same simple object four ways on one page and compare which suits it best.', w: 16 },
    ] },
  { id: 'fundamentals', n: 'Drawing fundamentals', d: 'For beginners of any age: marks, line, shapes, measuring, negative space, gesture and value.', mix: ['shading', 'perspective', 'sampler'],
    project: ['A finished observational drawing', ['Choose a subject you love and plan it with thumbnails', 'Light construction with basic shapes and measuring', 'Refine contours and line weight', 'Add values, shadow shapes first', 'Details and textures', 'Final contrast and presentation']],
    lessons: [
      { t: 'Making marks', tech: ['marks'], make: 'A sampler page of 20 different marks, then a small tree drawn with at least five of them.', w: 2 },
      { t: 'Contour and blind contour', tech: ['contour'], make: 'Three blind contours of your hand, then one careful contour drawing looking at the hand most of the time.', w: 0 },
      { t: 'Building with basic shapes', tech: ['shapes'], make: 'Construct a teapot, toy or torch from spheres, boxes and cylinders, then refine the outline.', w: 4 },
      { t: 'Line weight', tech: ['line-weight'], make: 'Draw a pair of shoes in outline, then thicken the lines on the shadow side and where things overlap.', w: 10 },
      { t: 'Measuring and sighting', tech: ['sighting'], make: 'Draw a bottle and a cup side by side, checking heights, widths and angles with your pencil.', w: 16 },
      { t: 'Negative space', tech: ['negative-space'], make: 'Draw a chair or a pot plant by shading only the spaces around and between its parts.', w: 14 },
      { t: 'Gesture drawing', tech: ['gesture'], make: 'A page of 30-second and two-minute gestures of classmates or figure photos.', w: 3 },
      { t: 'Value and light', tech: ['value-scale', 'light-form'], make: 'A five-step value scale, then an egg shaded under a lamp.', w: 1 },
      { t: 'The grid method', tech: ['grid-method'], make: 'Copy a photo of an animal accurately using a grid of 3 cm squares.', w: 9 },
      { t: 'Still life drawing', tech: ['still-life'], make: 'A measured, shaded drawing of a three-object still life.', w: 6 },
    ] },
  { id: 'charcoal', n: 'Charcoal and tone', d: 'Big, dramatic tonal drawing: vine and compressed charcoal, lifting out lights, chiaroscuro and drapery.', mix: ['shading', 'ink', 'portrait'],
    project: ['A dramatic charcoal still life', ['Set up objects with one strong lamp and make value thumbnails', 'Tone the paper and place the big shapes', 'Mass in the darks', 'Lift out the lights', 'Mid-tones, edges and textures', 'Final darkest darks, brightest lights and fixing']],
    lessons: [
      { t: 'Vine and compressed charcoal', tech: ['charcoal'], make: 'A mark sampler with vine, compressed and pencil charcoal, then smudge and lift each one.', w: 2 },
      { t: 'Toned ground and lifting out', tech: ['subtractive'], make: 'Tone the page mid-grey and lift out the lights of an egg and a cup.', w: 1 },
      { t: 'Big value shapes', tech: ['notan', 'value-scale'], make: 'Squint at a still life and draw it in three flat values only.', w: 6 },
      { t: 'Light on form', tech: ['light-form'], make: 'Draw a sphere, a cylinder and a cube in charcoal with all five tones.', w: 4 },
      { t: 'Chiaroscuro', tech: ['chiaroscuro'], make: 'A dramatically lit object (one lamp, lights low) emerging from a dark background.', w: 6 },
      { t: 'Drapery and folds', tech: ['drapery'], make: 'Hang a cloth from one pin and draw the folds, then their shadows.', w: 3 },
      { t: 'Textures in charcoal', tech: ['textures'], make: 'Draw a rough, a smooth and a shiny object side by side.', w: 11 },
      { t: 'A portrait in charcoal', tech: ['face', 'subtractive'], make: 'A tonal portrait from a strongly lit photo, working from dark to light.', w: 6 },
    ] },
  { id: 'ink', n: 'Pen and ink', d: 'Confident line, hatching, stippling, textures, pattern and ink wash, ending with a detailed illustration.', mix: ['shading', 'watercolour', 'perspective'],
    project: ['A detailed pen and ink illustration', ['Collect references and make thumbnails', 'A light pencil layout', 'Ink the key outlines with line weight', 'Build values with hatching or stippling', 'Textures and patterns', 'Final darks, white space and signature']],
    lessons: [
      { t: 'Pen control and line quality', tech: ['pen-ink', 'marks'], make: 'A page of confident lines, curves and spirals, then a leaf drawn straight in pen, no pencil first.', w: 2 },
      { t: 'Hatching in ink', tech: ['hatching'], make: 'Hatch a value scale, then a mushroom or a cup.', w: 13 },
      { t: 'Cross-hatching in ink', tech: ['cross-hatching'], make: 'Cross-hatch a shoe or a bottle in four layers.', w: 13 },
      { t: 'Stippling', tech: ['stippling'], make: 'Stipple a seashell or a pine cone.', w: 1 },
      { t: 'Contour hatching', tech: ['contour-hatching'], make: 'Hatch a banana or a tree trunk with lines that follow the form.', w: 7 },
      { t: 'A library of textures', tech: ['textures'], make: 'Six squares of ink textures: wood, fur, brick, grass, water and metal.', w: 11 },
      { t: 'Ink wash', tech: ['ink-wash'], make: 'A three-value ink wash landscape, with pen detail added once it’s dry.', w: 15 },
      { t: 'Pattern and line', tech: ['pattern'], make: 'Fill a large letter or an animal silhouette with sections of different patterns.', w: 12 },
      { t: 'Sketching a street', tech: ['one-point', 'pen-ink'], make: 'Draw a street, a hallway or a room in pen using one-point perspective.', w: 7 },
    ] },
  { id: 'colpencil', n: 'Coloured pencil', d: 'Layering, colour mixing on the page, burnishing, textures and realistic subjects.', mix: ['colour', 'watercolour', 'animals'],
    project: ['A realistic coloured pencil piece', ['Choose a reference, crop it and plan the colours', 'A light outline and value map', 'First light layers over the whole piece', 'Build the darks and mid-tones', 'Textures and details', 'Burnish, sharpen edges and add highlights']],
    lessons: [
      { t: 'Layering and pressure', tech: ['coloured-pencil'], make: 'A layering chart: each pencil layered over every other one.', w: 1 },
      { t: 'A colour wheel in pencil', tech: ['colour-wheel'], make: 'A 12-step colour wheel mixed only by layering three primaries.', w: 8 },
      { t: 'Burnishing', tech: ['coloured-pencil', 'blending'], make: 'Draw a cherry or a gumnut and burnish it to a shine.', w: 2 },
      { t: 'Shadows without black', tech: ['neutrals', 'temperature'], make: 'Shade an orange using blue and purple in the shadows instead of black.', w: 6 },
      { t: 'Realistic fruit', tech: ['light-form', 'coloured-pencil'], make: 'A sliced kiwi fruit or orange with highlights and a cast shadow.', w: 16 },
      { t: 'Textures in colour', tech: ['textures'], make: 'A feather and a stone side by side.', w: 11 },
      { t: 'Fur in colour', tech: ['animals', 'coloured-pencil'], make: 'Fur in short, directional strokes from a pet photo.', w: 3 },
      { t: 'An eye in colour', tech: ['eyes'], make: 'A realistic eye from a reference photo.', w: 9 },
    ] },
  { id: 'watercolour', n: 'Watercolour', d: 'Washes, wet-in-wet, textures, skies, trees, water and a finished landscape.', mix: ['ink', 'colour', 'landscape'],
    project: ['A finished watercolour landscape', ['Choose a reference and plan the values with thumbnails', 'A light drawing, and masking the whites', 'First washes: sky and big shapes', 'Middle values and soft edges', 'Darks, details and crisp edges', 'Final glazes and lifted highlights']],
    lessons: [
      { t: 'Flat and graded washes', tech: ['washes'], make: 'Flat, graded and variegated wash swatches, then a simple sunset sky.', w: 15 },
      { t: 'Wet-in-wet and wet-on-dry', tech: ['wet-in-wet'], make: 'A soft wet-in-wet background with crisp wet-on-dry leaves on top.', w: 15 },
      { t: 'Mixing colour in watercolour', tech: ['colour-wheel', 'tints-shades'], make: 'A mixing chart from three primaries, then a small fruit study.', w: 8 },
      { t: 'Salt, lifting and resist', tech: ['wc-textures'], make: 'A night sky or an underwater scene using salt, wax resist and lifting.', w: 11 },
      { t: 'Skies and clouds', tech: ['skies'], make: 'Three small skies: clear, cloudy and stormy.', w: 15 },
      { t: 'Trees and foliage', tech: ['trees'], make: 'A gum tree painted as masses of light and shadow, not leaves.', w: 4 },
      { t: 'Water and reflections', tech: ['water'], make: 'A boat or a jetty with its reflection in still water.', w: 7 },
      { t: 'Loose florals', tech: ['wet-in-wet', 'temperature'], make: 'Loose flowers painted as shapes, not outlines.', w: 15 },
      { t: 'A landscape in layers', tech: ['atmospheric'], make: 'Three layers of landscape: pale far hills, a middle ground, a dark foreground.', w: 6 },
    ] },
  { id: 'acrylic', n: 'Acrylic painting', d: 'Blocking in, mixing, blending, dry brush, impasto and glazing, ending with a painting on canvas.', mix: ['colour', 'landscape', 'sampler'],
    project: ['A finished acrylic painting on canvas', ['Thumbnails and a colour plan', 'Drawing and a toned underpainting', 'Block in the big shapes', 'Build light and shadow', 'Texture and details', 'Highlights, glazes and varnish']],
    lessons: [
      { t: 'Brushes, mixing and blocking in', tech: ['acrylic'], make: 'Block in a simple apple in flat colour, then a second layer of light and shadow.', w: 4 },
      { t: 'Tints and shades', tech: ['tints-shades'], make: 'A tints-and-shades strip for one colour, then a one-colour value study.', w: 1 },
      { t: 'Blending a sky', tech: ['acrylic', 'blending'], make: 'A blended sunset sky, worked quickly while the paint is wet.', w: 15 },
      { t: 'Dry brush and scumbling', tech: ['dry-brush'], make: 'Grass and weathered wood using dry brush.', w: 11 },
      { t: 'Impasto and palette knife', tech: ['impasto'], make: 'A textured flower or seascape using a palette knife.', w: 2 },
      { t: 'Glazing', tech: ['acrylic', 'hue-value-sat'], make: 'Glaze transparent colour over a grey underpainting.', w: 6 },
      { t: 'Still life in paint', tech: ['still-life', 'light-form'], make: 'Paint a two-object still life from life.', w: 6 },
      { t: 'A landscape with depth', tech: ['atmospheric', 'skies'], make: 'A landscape that goes cool and pale in the distance and warm and strong up close.', w: 8 },
    ] },
  { id: 'colour', n: 'Colour theory and mixing', d: 'The colour wheel, value, temperature, harmonies, neutrals and skin tones, with paint or coloured pencil.', mix: ['watercolour', 'acrylic', 'colpencil'],
    project: ['A colour-planned painting', ['Choose a subject and a colour scheme', 'Colour thumbnails: three versions', 'Drawing and the first big colour shapes', 'Build values within the scheme', 'Accents and a focal point in the complement', 'Final adjustments and a title']],
    lessons: [
      { t: 'The colour wheel', tech: ['colour-wheel'], make: 'Paint a 12-part colour wheel from red, yellow and blue.', w: 8 },
      { t: 'Hue, value and saturation', tech: ['hue-value-sat'], make: 'A value strip for one hue, then a strip mixing it towards grey.', w: 6 },
      { t: 'Tints, tones and shades', tech: ['tints-shades'], make: 'A one-colour painting of a simple object using tints and shades.', w: 1 },
      { t: 'Warm and cool', tech: ['temperature'], make: 'Paint the same small scene twice: once warm, once cool.', w: 8 },
      { t: 'Complementary colours', tech: ['schemes', 'neutrals'], make: 'A complementary painting, such as an orange fish in blue water.', w: 8 },
      { t: 'Analogous harmony', tech: ['schemes'], make: 'A landscape using three colours that sit side by side on the wheel.', w: 15 },
      { t: 'Mixing neutrals', tech: ['neutrals'], make: 'Mix ten browns and greys from pairs of complements, and label each recipe.', w: 8 },
      { t: 'Skin tones', tech: ['skin-tones'], make: 'A skin tone chart with recipes, then a small portrait study.', w: 8 },
      { t: 'Colour and mood', tech: ['temperature', 'schemes'], make: 'An abstract painting that shows a feeling using colour alone.', w: 12 },
    ] },
  { id: 'portrait', n: 'Portraits and faces', d: 'Proportions, features, the turning head, shading the face and a self-portrait.', mix: ['charcoal', 'colpencil', 'fundamentals'],
    project: ['A finished portrait', ['Choose and crop a reference, then thumbnails', 'Proportion guidelines and a light layout', 'Place and refine the features', 'Big shadow shapes', 'Mid-tones, hair and features', 'Final values, edges and background']],
    lessons: [
      { t: 'Proportions of the face', tech: ['face'], make: 'A front-on face with guidelines, then the same guidelines over a photo.', w: 4 },
      { t: 'Eyes', tech: ['eyes'], make: 'A page of eye shapes, then one eye fully shaded.', w: 7 },
      { t: 'Noses and mouths', tech: ['face', 'light-form'], make: 'Shade a nose and lips as simple forms with planes and shadows.', w: 4 },
      { t: 'Hair and ears', tech: ['textures', 'face'], make: 'Hair drawn as big masses first, with strands only at the edges.', w: 3 },
      { t: 'The head at an angle', tech: ['face', 'shapes'], make: 'Heads turned three-quarters, built from a ball with curved guidelines.', w: 4 },
      { t: 'Shading the face', tech: ['light-form', 'blending'], make: 'A tonal study of a strongly lit portrait photo.', w: 6 },
      { t: 'Expressions', tech: ['face'], make: 'Six quick sketches of different expressions, from a mirror or photos.', w: 3 },
      { t: 'Self-portrait', tech: ['face', 'sighting'], make: 'A self-portrait from a mirror.', w: 16 },
    ] },
  { id: 'animals', n: 'Animals', d: 'Animals from shapes, gesture, fur and feathers, eyes and Australian wildlife.', mix: ['colpencil', 'ink', 'watercolour'],
    project: ['A finished animal portrait', ['Choose a reference and crop for impact', 'Construct the animal from shapes', 'Refine the outline and features', 'Map the fur direction and big values', 'Fur, feathers and texture', 'Eyes, final darks and highlights']],
    lessons: [
      { t: 'Animals from shapes', tech: ['animals', 'shapes'], make: 'A cat, a dog and a bird, each built from circles and ovals.', w: 4 },
      { t: 'Animal gestures', tech: ['gesture'], make: 'Quick gestures of animals moving, from videos or photos.', w: 3 },
      { t: 'Fur and feathers', tech: ['textures'], make: 'Short and long fur swatches, then a feather.', w: 11 },
      { t: 'Animal eyes', tech: ['eyes'], make: 'A realistic animal eye with its highlight and reflection.', w: 16 },
      { t: 'Australian animals', tech: ['animals', 'contour'], make: 'A kookaburra, koala or wombat from a photo reference.', w: 0 },
      { t: 'An animal in tone', tech: ['light-form', 'blending'], make: 'A shaded close-up of a pet’s face.', w: 6 },
      { t: 'Animals in colour', tech: ['coloured-pencil', 'temperature'], make: 'A colourful bird, such as a rosella or rainbow lorikeet, in coloured pencil or watercolour.', w: 8 },
      { t: 'Patterned animals', tech: ['pattern'], make: 'An animal silhouette filled with patterns.', w: 12 },
    ] },
  { id: 'landscape', n: 'Landscapes and nature', d: 'Depth, skies, trees, water and composition, ending with a finished landscape.', mix: ['watercolour', 'acrylic', 'perspective'],
    project: ['A finished landscape', ['Choose a place and make four thumbnails', 'Plan the composition and the light', 'Sky and the far distance', 'Middle ground: trees, hills and water', 'Foreground detail and texture', 'Final contrast, edges and a focal point']],
    lessons: [
      { t: 'Simple depth', tech: ['depth-cues'], make: 'A landscape using overlap, size and placement to show distance.', w: 5 },
      { t: 'Atmospheric perspective', tech: ['atmospheric'], make: 'Layered hills that get lighter and cooler as they go back.', w: 6 },
      { t: 'Skies and clouds', tech: ['skies'], make: 'Clouds with light tops and shaded bases.', w: 15 },
      { t: 'Trees', tech: ['trees'], make: 'Three trees, a gum, a pine and a bushy tree, each drawn as masses.', w: 4 },
      { t: 'Water', tech: ['water'], make: 'A lake with reflections, or waves on a beach.', w: 2 },
      { t: 'Composition and thumbnails', tech: ['thirds', 'thumbnails'], make: 'Four thumbnails of one landscape photo, then develop the best one.', w: 6 },
      { t: 'Leading lines', tech: ['leading-lines'], make: 'A path or river that leads the eye to a focal point.', w: 2 },
      { t: 'Drawing outside', tech: ['viewfinder', 'sketchbook'], make: 'Go outside with a viewfinder and sketch the view for 30 minutes.', w: 14 },
    ] },
  { id: 'perspective', n: 'Perspective and buildings', d: 'Depth cues, one-, two- and three-point perspective, ellipses and foreshortening.', mix: ['ink', 'fundamentals', 'landscape'],
    project: ['An imaginary city or room', ['Plan the scene and the horizon line', 'Construction lines and vanishing points', 'The main shapes and openings', 'Details: windows, signs and people', 'Shading and cast shadows', 'Ink or colour, and finish']],
    lessons: [
      { t: 'Depth cues', tech: ['depth-cues'], make: 'A street of houses using overlap, size and placement.', w: 5 },
      { t: 'One-point perspective', tech: ['one-point'], make: 'A road or hallway disappearing to one vanishing point.', w: 0 },
      { t: 'A one-point room', tech: ['one-point'], make: 'Your dream bedroom in one-point perspective.', w: 7 },
      { t: 'Two-point boxes', tech: ['two-point'], make: 'Boxes above, on and below the horizon line.', w: 4 },
      { t: 'Two-point buildings', tech: ['two-point'], make: 'A street corner with doors, windows and an awning.', w: 7 },
      { t: 'Ellipses and cylinders', tech: ['ellipses'], make: 'Cups, bottles and jars seen from different eye levels.', w: 7 },
      { t: 'Three-point perspective', tech: ['three-point'], make: 'A skyscraper seen from the footpath below.', w: 0 },
      { t: 'Foreshortening', tech: ['foreshortening'], make: 'A hand or a pencil pointing straight at you.', w: 0 },
    ] },
  { id: 'mindful', n: 'Mindful art (wellbeing)', d: 'A calmer term of art for wellbeing: breath, pattern, feelings, strengths and connection.', mix: ['sampler', 'colour'],
    project: ['A wellbeing art journal', ['A cover that feels like you', 'A calm page: patterns and breathing lines', 'A feelings page: a colour map', 'A strengths page', 'A gratitude page', 'Share (only if you want to) and celebrate']],
    lessons: [
      { t: 'Breathing lines', tech: ['a:breath-lines'], make: 'A page of breathing lines, turned into a calm landscape or pattern.', w: 12 },
      { t: 'A mindful mandala', tech: ['a:mandala'], make: 'A radial mandala built ring by ring at a slow pace.', w: 12 },
      { t: 'Inner weather', tech: ['a:inner-weather'], make: 'A weather picture of how you feel today.', w: 12 },
      { t: 'Scribble and find', tech: ['a:scribble-find'], make: 'Turn a loose scribble into creatures and scenes.', w: 5 },
      { t: 'Slow looking', tech: ['a:slow-looking'], make: 'A slow, detailed drawing of one small natural object.', w: 16 },
      { t: 'Nature mandala', tech: ['a:nature-mandala'], make: 'A mandala of leaves, petals and stones, photographed and then drawn.', w: 11 },
      { t: 'Strength shield', tech: ['a:strength-shield'], make: 'A shield showing your strengths, people and places that help.', w: 12 },
      { t: 'Kindness cards', tech: ['a:kindness-cards'], make: 'Small cards with images and kind words to give away.', w: 5 },
      { t: 'Group mural', tech: ['a:group-mural'], make: 'A shared mural where everyone’s marks join up.', w: 12 },
    ] },
  { id: 'sampler', n: 'Mixed media for kids', d: 'A hands-on term trying a new material each week: collage, printing, oil pastel, resist and more.', mix: ['colour', 'animals', 'mindful'],
    project: ['A mixed media masterpiece', ['Plan a picture and gather papers', 'A painted background', 'Collage the big shapes', 'Printed or drawn details', 'Oil pastel highlights and patterns', 'Title, sign and exhibit']],
    lessons: [
      { t: 'Torn paper collage', tech: ['collage'], make: 'A torn-paper collage of an animal.', w: 5 },
      { t: 'Foam printing', tech: ['printmaking'], make: 'A foam print of a leaf or a fish, printed three times in different colours.', w: 11 },
      { t: 'Oil pastel and scratching', tech: ['pastels'], make: 'An oil pastel sunset with scratched-in details.', w: 2 },
      { t: 'Wax resist', tech: ['wc-textures'], make: 'A wax-resist underwater scene.', w: 15 },
      { t: 'Patterns', tech: ['pattern'], make: 'A self-portrait outline filled with patterns.', w: 12 },
      { t: 'Colour wheel pizza', tech: ['colour-wheel'], make: 'A colour wheel painted as pizza slices.', w: 8 },
      { t: 'Animals from shapes', tech: ['animals', 'shapes'], make: 'Draw and paint a bird or a fish built from simple shapes.', w: 4 },
      { t: 'In the style of a famous artist', tech: ['master-study'], make: 'A picture in the style of an artist, such as Van Gogh’s swirls or Matisse’s cut-outs.', w: 5 },
    ] },
];
const FOCUS_BY = Object.fromEntries(FOCUS.map(f => [f.id, f]));
const OPTION_INFO = {
  steps: ['Step by step', 'One skill a week, each building on the last, finishing with a showcase piece.', '#3346A8'],
  project: ['Big project', 'A few skill weeks, then one finished piece built in stages over several weeks.', '#A3482A'],
  explore: ['Explorer', 'A different technique every week, borrowing from related areas, then a final piece mixing favourites.', '#1A7663'],
};
const AGES = [['kids', '5–8'], ['junior', '9–12'], ['teen', 'Teens'], ['adult', 'Adults']];
function focusFor(techId) { const f = FOCUS.find(x => x.id !== 'sampler' && x.lessons.some(l => l.tech[0] === techId)) || FOCUS.find(x => x.lessons.some(l => l.tech.includes(techId))); return f ? f.id : ''; }

// A lesson ready to teach: what to show, practise and make, with a warm-up and a way to share.
function buildLesson(L, f, i, o) {
  const id = L.tech[0], a = id.startsWith('a:') ? THERAPY_BY[id.slice(2)] : null, t = a ? null : TECH_BY[id];
  const firstSentence = s => { const m = /^[\s\S]*?[.!?](?=\s|$)/.exec(s || ''); return m ? m[0] : s || ''; };
  return {
    t: L.t, tech: L.tech.slice(), from: o.planName || f.n, wk: i + 1, age: o.age, make: L.make,
    aim: a ? firstSentence(a.purpose) : t ? firstSentence(t.why) : '',
    warm: WARMUPS[(L.w === undefined ? i : L.w) % WARMUPS.length],
    demo: a ? a.steps.slice(0, 2).join(' ') : t ? t.steps.slice(0, 3).join(' ') : '',
    practice: a ? (a.steps[2] || a.steps[0]) : t ? t.ex : '',
    share: a ? `Optional sharing: ${a.reflect[0]}` : SHARES[i % SHARES.length],
    kids: t && (o.age === 'kids' || o.age === 'junior') ? t.kids : '',
  };
}
// Splits the class time into parts that suit the age group (in 5-minute steps for longer classes).
function runSheet(p, mins = 60, age = 'adult') {
  const prof = {
    kids: [['Warm-up', 0.15, 'warm'], ['Show and tell', 0.1, 'demo'], ['Make', 0.55, 'make'], ['Share and tidy', 0.2, 'share']],
    junior: [['Warm-up', 0.12, 'warm'], ['Demonstration', 0.13, 'demo'], ['Practice', 0.25, 'practice'], ['Project', 0.35, 'make'], ['Share', 0.15, 'share']],
    teen: [['Warm-up', 0.1, 'warm'], ['Demonstration', 0.15, 'demo'], ['Guided practice', 0.3, 'practice'], ['Project work', 0.35, 'make'], ['Reflect', 0.1, 'share']],
  }[age] || [['Warm-up', 0.1, 'warm'], ['Demonstration', 0.15, 'demo'], ['Guided practice', 0.3, 'practice'], ['Project work', 0.35, 'make'], ['Reflect', 0.1, 'share']];
  const step = mins >= 30 ? 5 : 1, units = Math.round(mins / step);
  const raw = prof.map(x => x[1] * units), fl = raw.map(Math.floor);
  let left = units - sum(fl);
  raw.map((r, i) => [r - fl[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { fl[i]++; left--; } });
  return prof.map((x, i) => {
    let txt = p[x[2]];
    if (x[2] === 'warm' && Array.isArray(txt)) txt = `${txt[0]}. ${txt[1]}`;
    if (x[2] === 'make' && p.kids) txt = `${txt} ${p.kids}`;
    return [fl[i] * step, x[0], txt || ''];
  }).filter(r => r[0] > 0);
}
// Three different plans for the same focus, level, age and number of weeks.
function planOptions({ focus, weeks, lvl, age }) {
  const f = FOCUS_BY[focus], start = Math.min(lvl - 1, Math.max(0, f.lessons.length - weeks)), o = { age };
  const finalWeek = (used, i, how) => ({ t: 'Final piece and showcase', tech: [...new Set(used.flatMap(l => l.tech))].slice(0, 3), make: how, w: 6 });
  const steps = () => {
    const ls = f.lessons.slice(start, start + weeks - 1);
    while (ls.length < weeks - 1) { const k = ls.length % Math.max(1, f.lessons.length); ls.push(Object.assign({}, f.lessons[k], { t: `${f.lessons[k].t}: going further`, make: `Take week ${k + 1}’s skill further on a new subject: ${f.lessons[k].make.charAt(0).toLowerCase()}${f.lessons[k].make.slice(1)}` })); }
    ls.push(finalWeek(ls, weeks - 1, 'Choose a favourite technique from this term and make a finished piece. End with a mini exhibition.'));
    return ls;
  };
  const project = () => {
    const skills = Math.min(weeks >= 8 ? 3 : 2, weeks - 2), ls = f.lessons.slice(start, start + skills);
    const [pn, stages] = f.project, slots = weeks - skills - 1, out = [];
    for (let i = 0; i < slots; i++) { const k = Math.min(stages.length - 1, Math.floor((i * stages.length) / slots)), again = out.some(x => x.st === k); out.push({ t: `${pn}: ${stages[k].charAt(0).toLowerCase()}${stages[k].slice(1)}${again ? ' (continued)' : ''}`, tech: f.lessons[Math.min(f.lessons.length - 1, start + (i % Math.max(1, skills)))].tech, make: `${stages[k]}.${again ? ' Keep going from last week.' : ''}`, w: (i + 3) % WARMUPS.length, st: k }); }
    return ls.concat(out, [{ t: `${pn}: finish and exhibit`, tech: ls.length ? ls[0].tech : f.lessons[0].tech, make: 'Final touches, sign and title the work, then a mini exhibition with a short artist statement.', w: 6 }]);
  };
  const explore = () => {
    const pools = [f.lessons.slice(start)].concat(f.mix.map(id => FOCUS_BY[id].lessons.filter(l => !f.lessons.some(x => x.tech[0] === l.tech[0]))));
    const ls = [], seen = new Set();
    for (let r = 0; ls.length < weeks - 1 && r < 20; r++) {
      for (const p of pools) {
        const l = p.find(x => !seen.has(x.tech[0]));
        if (l && ls.length < weeks - 1) { seen.add(l.tech[0]); ls.push(l); }
      }
    }
    ls.push(finalWeek(ls, weeks - 1, 'Mix two or three of this term’s techniques in one finished piece, then share what you discovered.'));
    return ls;
  };
  return { steps: steps(), project: project(), explore: explore() };
}
// The full plan, with each week's lesson ready to use.
function makePlan({ focus, weeks, lvl, age, opt }) {
  const f = FOCUS_BY[focus], ls = planOptions({ focus, weeks, lvl, age })[opt], name = `${f.n}: ${OPTION_INFO[opt][0].toLowerCase()}`;
  return { focus, weeks: ls.map((L, i) => buildLesson(L, f, i, { age, planName: name })), lvl, age, opt: OPTION_INFO[opt][0], name };
}
