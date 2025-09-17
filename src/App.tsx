import React, { useState, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import GoogleDriveSlideshow from './components/GoogleDriveSlideshow';
import ComedySlideshow from './components/ComedySlideshow';
import './index.css';
import { detectDeviceType, getInitialZoomLevel, getDeviceCenterPosition } from './utils/deviceDetection';

const App: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [showEraserAnimation, setShowEraserAnimation] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true); // Overlay visible from load to avoid initial flash
  const [overlayAnimation, setOverlayAnimation] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hasPlayedAnimations, setHasPlayedAnimations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialPositionSet, setInitialPositionSet] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const clickStart = useRef<{ x: number; y: number } | null>(null);

  // Get initial zoom level based on device type
  const initialScale = getInitialZoomLevel();
  const imageWidth = 8472;
  const imageHeight = 5992;

  // Page detection – are we on /zoomfly?
  const isZoomFly = typeof window !== 'undefined' && window.location.pathname.includes('zoomfly');

  // Updated ZoomFly button coordinates (adding 40px to x, 30px to y)
  const zoomFlyCoords = { x: 4727, y: 5178 };

  // Allow full-image zoom-out on zoomfly page
  const fitScale = typeof window !== 'undefined'
    ? Math.min(window.innerWidth / imageWidth, window.innerHeight / imageHeight)
    : 0.1;
  const minScaleValue = isZoomFly ? fitScale : 0.5;

  // Calculate percentage positions for brand buttons
  const brandButtons = [
    { text: 'Certa', x: 7074, y: 1406, width: 190, height: 120 },
    { text: 'Tayto', x: 7084, y: 1544, width: 320, height: 100 },
    { text: 'Lyons', x: 7069, y: 1660, width: 310, height: 100 },
    { text: 'Kerry', x: 7580, y: 1420, width: 170, height: 85 },
    { text: 'Aer Lingus', x: 7580, y: 1532, width: 350, height: 130 },
    { text: 'Headstuff', x: 7580, y: 1693, width: 390, height: 165 },
    { text: 'Whack', x: 7325, y: 1615, width: 180, height: 130 },
  ];

  // Helper to pick a color for each brand button
  const getBrandColor = (brandName: string): string => {
    const colors: Record<string, string> = {
      'Certa': 'orange',
      'Tayto': 'blue',
      'Lyons': 'red',
      'Kerry': 'pink',
      'Aer Lingus': 'teal',
      'Headstuff': 'green',
      'Whack': 'yellow',
    };
    return colors[brandName] || 'transparent';
  };

  // Calculate percentage positions for text box and slideshow
  const textBoxPosition = {
    x: 6900 - 12 - 10 + 8, // Move left by 12px and then 10px more, then 8px right
    y: 924 - 12 - 14 - 8 - 6 - 25 - 15, // Move up by 12px and then 14px more, then 8px more, then 6px more, then 25px more, then 15px more
    width: 250 - 15 - 5 - 8 + 20 + 8 + 8 + 20 + 20 + 15 + 5, // Make 28px narrower total (15px + 5px + 8px) and add 20px as requested, plus 8px more, plus 8px more, plus 20px more, plus 20px more, plus 15px more, plus 5px more
    height: 200 + 20 + 30 + 25, // Increase height by 20px and then 30px more, then 25px more
  };

  const slideshowPosition = {
    x: 7200 + 100 - 30, // Move right by 70px
    y: 924 + 50 - 30, // Move down by 20px
    width: 400 + 240, // Make 240px wider
    height: 300 + 60, // Make 60px taller
  };

  const hoverTextBoxPosition = {
    x1: 1119, // New position
    y1: 610, // New position
    x2: 1239, // Width reduced by 30px (1244 - 1124 = 120px)
    y2: 793, // Height reduced by 30px (768 - 623 = 145px)
  };

  // Calculate percentage positions for hover areas
  const hoverAreas = [
    { text: 'Spiders', x: 1381, y: 520, width: 135, height: 150 }, // 10px higher
    { text: 'ICAD', x: 952, y: 736, width: 90, height: 120 }, // 10px wider
    { text: 'Sharks', x: 990, y: 510, width: 220, height: 170, rotation: 6 },
    { text: 'APMCs', x: 1177, y: 490, width: 100, height: 100 },
    { text: 'DMAs', x: 1401, y: 714, width: 135, height: 150 },
    { text: 'IAAs', x: 1354, y: 932, width: 170, height: 95, rotation: -6 },
    { text: 'Impact', x: 975, y: 951, width: 100, height: 165 }, // 15px taller
  ];

  // Hoverable items data
  const hoverableItems = [
    { text: 'Spiders', x: 1381, y: 520, width: 135, height: 150 },
    { text: 'ICAD', x: 952, y: 736, width: 90, height: 120 },
    { text: 'Sharks', x: 990, y: 510, width: 220, height: 170, rotation: 6 },
    { text: 'APMCs', x: 1177, y: 490, width: 100, height: 100 },
    { text: 'DMAs', x: 1401, y: 714, width: 135, height: 150 },
    { text: 'IAAs', x: 1354, y: 932, width: 170, height: 95, rotation: -6 },
    { text: 'Impact', x: 975, y: 951, width: 100, height: 165 },
  ];

  // Hover text content
  const hoverTextContent = {
    Spiders: "Spiders\n\n2023\nWhere is Mr Tayto?\nGold in Social Media",
    ICAD: "ICADs\n\n2023\nWhere is Mr Tayto?\nBronze in Integrated",
    Sharks: "Kinsale Sharks\n\n2024\nAer Lingus \"Calm\"\nBronze in Digital\n\n2022\nWhere is Mr Tayto?\nSilver in PR & Tactical\nBronze in Food & Confectionery/ Social Media/ Integrated Campaign/ Social Media for influencer content",
    APMCs: "APMCs\n\n2024\nLyons \"We're Square\"\nSilver in Non-Alc Beverage\nBronze in Integrated Campaign / Use of Talent\n\n2023\nWhere is Mr Tayto?\nGold in Use of Digital / FMCG\nSilver in Integrated Campaign",
    DMAs: "Digital Media Awards\n\n2022\nWhere is Mr Tayto?\nGold in Strategy",
    IAAs: "Irish Audio Awards\n\n2025\nLyons Gen Tea\nWin in Casting\nShortlists in Innovation / Consumer\n\n2024\nHeadstuff \"If this sounds like you…\"\nShortlist in Copywriting Craft",
    Impact: "European Impact Awards\n\n2024\nLyons \"We're Square\"\nBronze in Integrated\n\n2023\nWhere is Mr Tayto?\nGold in Integrated"
  };

  // Add eraser animation state
  const [eraserPosition, setEraserPosition] = useState({
    top: `${850 / 5992 * 100}%`,
    left: `${5500 / 8472 * 100}%`,
    width: '667px',
    height: '230px',
  });

  // Brand text content
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentCopyIndex, setCurrentCopyIndex] = useState(0);

  // --- Slideshows for each brand (Google Drive links remain as before) ---
  const brandContent: Record<string, { description: string; slides: { url: string; type: 'video' | 'image' }[] }> = {
    Lyons: {
      description: currentSlide >= 10 && currentSlide <= 17
        ? 'Gen Tea\nLyons\nRadio-first campaign bringing generations together.'
        : 'We\'re Square\nLyons\nCelebrating our spiritually square brew.',
      slides: [
        { url: 'https://drive.google.com/file/d/1NQrYVED2G54hhl4cKv_zPrfWuMuwVtH4/preview', type: 'video' },
        { url: 'https://lh3.googleusercontent.com/d/1CpzUwRmRax9c8PSlZEw-mR4FX0dubYe-', type: 'image' },
        { url: 'https://lh3.googleusercontent.com/d/1Nd2qIlW45gLmUfKOdfAex8BWYyNP6ec-', type: 'image' },
        { url: 'https://lh3.googleusercontent.com/d/1ryHRz4AXdNsmcEO7AzP4_c0wGuZX5RAj', type: 'image' },
        { url: 'https://lh3.googleusercontent.com/d/1lClZrPKMdeKOcG4-veYuj8a-RtQ9wWzp', type: 'image' },
        { url: 'https://lh3.googleusercontent.com/d/1IUHwGiyWL54CDFWzz5MTy9wbHd9iv1rd', type: 'image' },
        { url: 'https://lh3.googleusercontent.com/d/1hTAGaHk50rrtIrVStjptZmnNv_lDbXhk', type: 'image' },
        { url: 'https://lh3.googleusercontent.com/d/1JPKghp0qQSWakjdZtZ0F70mr5OzdCeAK', type: 'image' },
        { url: 'https://lh3.googleusercontent.com/d/1ozA3J-7YBS8BmApUxT5hqBAQvHCgw0XN', type: 'image' },
        { url: 'https://drive.google.com/file/d/1TmiHdwrUVQstabfuQ1A6FDOkpGrUiySl/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1j687Vgae0nsUlW3TnAugtW7ND4713Y4e/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1NatbnSB6u2h8zrZ5Z7HjEtoZd-rmntKq/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1Fy3qsbCOL9AG67p5mKD9Cy8zUuz3bukU/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1Tk5Hb_X9zwr4-f_ndSACik2cQj58qgZq/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/11__8QbUNirZW7dGc_eW61a2A-tTyX2-k/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1Df6zl2wRhgLlxUXKQDNcexHMyL-RHvM4/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/12c1Eh-xowoibPFIRTDfpvIPxEpwDHFU5/preview', type: 'video' },
        { url: 'https://lh3.googleusercontent.com/d/1CD3KmCVd8mNH5dfNiVWXpiLoZcvDbBfm', type: 'image' }
      ]
    },
    Tayto: {
      description: 'Where Is Mr Tayto\nTayto\nMaking the mascot matter to Gen-Z.',
      slides: [
        { url: 'https://drive.google.com/file/d/1QKtDkmBtEpkBdfXOiajz9i7atViXJy8K/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/19uvguWDXZa_vyjI4SdPgC9wB-frpgwJs/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1SkK0GWSf2ilXQJOWnh-Gt7-G1XORLsTJ/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1lCBUzBlKKHmZ1Rj5yhCvfdcfLdBlwmJQ/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1clYdMoRyXKsvj1SmlNZn0iMGJGF8XnD0/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1eFi9_1z9d7xU7QiWppQ0Z1BGdV8w_PNI/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1LN-KrS3rSjXAWDDAGyYqr0cEstnGKKS8/preview', type: 'video' },
        { url: 'https://lh3.googleusercontent.com/d/1zebyXCigSxhSe3Pt4Bitqa3nMa61Yklj', type: 'image' }
      ]
    },
    Kerry: {
      description: 'Pride of Kerry\nKerry Group\n30 years of proud sponsorship.',
      slides: [
        { url: 'https://drive.google.com/file/d/1NE3dQCKTOFJYPHpygrctYd27uyvCoYI-/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1ZuxMQ7a2tBTTYQT-xJEcogXHBH9Bmeot/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1e5BSWf5i0gQgKMkLGngBZuXGPDhSGkgX/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1VwmvseffaV5PXmQ_kRlHULvndk8zaogB/preview', type: 'video' }
      ]
    },
    Certa: {
      description: 'Breaking Boundaries\nCerta\nLaunching women\'s cricket sponsorship.',
      slides: [
        { url: 'https://drive.google.com/file/d/15sOBTvKH2tJhCtTX5DeDK9FtmgrDGvq8/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1qdGHIrpxSBt6uaToELrr_IBtAwDQn7Wm/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1h0qHaHhrToued1LACuCCkGJyB0FZzWPH/preview', type: 'video' }
      ]
    },
    Headstuff: {
      description: 'Join the Cast\nHeadStuff\nCrowd-sourced podcasts on a shoestring.',
      slides: [
        { url: 'https://drive.google.com/file/d/1kA0teOILfxwbxkwk3iwZVwIx19ymVPKO/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1LNjQUX_HL1AWM6pYyBTy5knO-Iq-wcAc/preview', type: 'video' }
      ]
    },
    'Aer Lingus': {
      description: currentSlide === 1
        ? 'Calm\nAer Lingus\n8-hour ambience flights.'
        : 'Sadie\'s Home\nAer Lingus\nChristmas reunion film.',
      slides: [
        { url: 'https://drive.google.com/file/d/1JelRhbwXGZxNb84EED35Ers7JXSRB1R_/preview', type: 'video' },
        { url: 'https://drive.google.com/file/d/1kS-hfb3RmxUtkFw2VcTpjLWQ5KvJyIfq/preview', type: 'video' }
      ]
    },
    Whack: {
      description: 'The Property Market But It\'s A Coffee Shop\nWhack\nShowing how daft house-hunting norms are.',
      slides: [
        { url: 'https://drive.google.com/file/d/1HXRC1qRIcug9P_5f0RZ02ORapOQ7h_9q/preview', type: 'video' }
      ]
}
  };

  // COPY BLOCK ARRAYS (PER BRAND / PROJECT)
  const lyonsSquareCopy = [
    `Lyons\nWe’re Square\nClick the arrows and I’ll catch you up.`,
    `Brand Problem\nLyons had hyped pyramid bags for years; so flipping to square bags risked public uproar, flavour doubts and looking flakey on their messaging. This PR storm needed a good angle.`,
    `Creative Insight\nRivals were pretending their tea was trendy, which it’s not. It’s comfortingly uncool. And everything is better when it owns what it is anyway, so we embraced being square in every sense with “We’re Square”.`,
    `The Work\nKitsch kitchen signs airport takeover, granny-core OOH, corny merch, a square newspaper, an influencer tea party, a niche hobbyist chat-show - all to celebrate squares everywhere while explaining the new bags.`,
    `The Results\n84 media mentions, 12.2M total reach, 4.7M OOH impressions, an APMC Silver + two Bronze, a Bronze Impact Award - and Lyons kept its status as Ireland’s No.1 selling brew.`
  ];

  const lyonsGenTeaCopy = [
    `Lyons\nGen Tea\nClick the arrows and I’ll catch you up.`,
    `Brand Problem\nLyons wanted to bring back its “Puts the Talk into Tea” asset in a way that spoke to every demographic, with radio as their prime target.`,
    `Creative Insight\nStick a kettle on and ages melt away no matter who you’re talking to - even your grandparents. So, we bet inter-generational banter and genuine chats over tea could handily beat scripted ads.`,
    `The Work\nCreated 9 radio spots and 9 social clips by recording hours of tea & chat between three age-gapped pairs in a cosy cottage. We also released a slew of OOH flipping Gen-Z slang with Boomer sayings.`,
    `The Results\n53% radio coverage over 13 weeks; 470k audio platforms impressions; 26.6M impressions on Meta & TikTok; 500k OOH impressions - and an Audio Award in Casting to boot.`
  ];

  const taytoCopy = [
    `Tayto\nWhere Is Mr Tayto\nClick the arrows and I’ll catch you up.`,
    `Brand Problem\nGen Z hadn’t grown up with iconic Mr Tayto ads; the mascot felt a bit dusty. Tayto was feeling the sting as Ireland’s top crisp was fighting for attention.`,
    `Creative Insight\nYou only miss something once it’s gone. So if younger generations weren't going to give Mr Tayto attention, then we wondered how they’d feel if he just disappeared…`,
    `The Work\nBlank Mr Tayto-less crisp packets sparked conspiracies; weeks later ,after rocketing into relevance, he resurfaced on TikTok, saying he’s only getting ready for his holidays. Then the globe-trotting adventure began.`,
    `The Results\n50+ videos that doubled their following, 10M impressions, national coverage, a media partnership, influencer content - and more awards than crisps in a bag of tayto (which in awards terms is still a lot).`
  ];

  const aerSadiesCopy = [
    `Aer Lingus\nSadie’s Home\nClick the arrows and I’ll catch you up.`,
    `Brand Problem\nAfter a year of tough PR, Aer Lingus wanted to rekindle brand love before Christmas, but they only had six weeks and a budget that was just as slim.`,
    `Creative Insight\nIt’s gotten harder and harder for Airport reunions to melt hearts. You just always know what’s going to happen. So, we wanted to flip expectations and still get that magic moment.`,
    `The Work\nFor under €66k, we shot a 90-second social film in record time telling the story of a lonely young man at the airport collecting his best friend - his dog.`,
    `The Results\nReleased five days pre-Christmas, “Sadie’s Home” reached 1.2 million views.`
  ];

  const aerCalmCopy = [
    `Aer Lingus\nCalm\nClick the arrows and I’ll catch you up.`,
    `Brand Problem\nThe Aer Lingus rebrand promised a welcoming journey; they wanted digital content proving this.`,
    `Creative Insight\nOnline ambience loops dominate study playlists; and it’s always rainy coffee shops or forest streams. There weren’t a whole lot of flying window seats, which, to be fair, are pretty relaxing.`,
    `The Work\nWe created 3 eight-hour YouTube ambience videos: Clear sky, Sunset, and Night. They came with a view of an Aer Lingus shamrock wingtip and a gentle engine hum that was perfect for working and relaxing.`
  ];

  const kerryCopy = [
    `Kerry Group\nPride of Kerry\nClick the arrows and I’ll catch you up.`,
    `Brand Problem\nAfter 30 years backing Kerry county football, Kerry group wanted something special to celebrate and remind everybody of their long running sponsorship.`,
    `Creative Insight\nPride drives both Kerry GAA and Kerry’s scientific approach to nutrition. In both worlds, people at all levels take great pride in getting the finer details right. `,
    `The Work\nReleased a series of emotive docu-films under the umbrella Pride of Kerry. These didn’t just focus on players but the fans, coaches, support staff, and nutritionists who make up Kerry GAA.`,
    `The Results\n3 videos promoting the All Ireland, and a further 3 videos with 8 cutdowns for the Aer Lingus College Classic. A microsite, prideofkerry.ie, and 8 part cooking series that gets into the finer details of fuelling yourself.`
  ];

  const certaCopy = [
    `Certa\nBreaking Boundaries\nClick the arrows and I’ll catch you up.`,
    `Brand Problem\nCerta were launching their Irish women’s cricket sponsorship, and wanted to grab the country’s attention and let them know this is a world class team they should care about.`,
    `Creative Insight\nWe surveyed Irish people to learn about their understanding of cricket. The expected old notions came up: boring, old fashioned, confusing. None knew about modern cricket or our top tier women’s team. `,
    `The Work\n#BreakingBoundaries was a three part series of digital spots where old cricket relics like tea sets, cakes, and sandwich tiers were smashed apart by star players in mesmerising slow-motion. `
  ];

  const headstuffCopy = [
    `HeadStuff\nJoin The Cast\nClick the arrows and I’ll catch you up.`,
    `Brand Problem\nHeadStuff’s listenership was dipping and they needed some new shows to bring in new audiences. All without any budget.`,
    `Creative Insight\nWe’ve all heard somebody say “you should make a podcast out of that”. So why not give Headstuff’s listenership the chance to make one with a low-barrier audition using just a phone.`,
    `The Work\nOur podcast pilot competition, Join the Cast, needed just voicenotes for pitches with the best getting made into pilots and eventually a €10k series. We amplified with a pair of audio ads, “If this sounds like you”, targeting people who leave long ass voicenotes.`,
    `The Results\nThe competition drew 300+ entries and thousands of votes, a winner’s show green-lit. And for me an Irish Audio Award shortlist for “If this sounds like you”.`
  ];

  const whackCopy = [
    `Whack\nThe Property Market But It's A Coffee Shop\nClick the arrows and I’ll catch you up.`,
    `Brand Problem\nWhack was a new property tool tackling the crazy home buying norms encouraged by the likes of DAFT & MyHome. So, to launch it needed people to know what it is and what it's trying to do.`,
    `Creative Insight\nEverybody just accepts the ways the housing market works. But if you were to place them in any other context you'd see them for how daft they really are.`,
    `The Work\nWe shed genuinely funny light on the house-buying frustrations Whack is trying to tackle by showing how maddening they are when buying a coffee.`
  ];

  // Helper to choose correct copy set based on current slide index
  const getCopyBlocks = (brand: string): string[] => {
    switch (brand) {
      case 'Lyons':
        return currentSlide >= 10 && currentSlide <= 17 ? lyonsGenTeaCopy : lyonsSquareCopy;
      case 'Aer Lingus':
        return currentSlide === 1 ? aerCalmCopy : aerSadiesCopy;
      case 'Tayto':
        return taytoCopy;
      case 'Kerry':
        return kerryCopy;
      case 'Certa':
        return certaCopy;
      case 'Headstuff':
        return headstuffCopy;
      case 'Whack':
        return whackCopy;
      default:
        return [];
    }
  };

  // Reset copy index whenever brand or slide changes
  useEffect(() => {
    setCurrentCopyIndex(0);
  }, [selectedBrand, currentSlide]);

  // Handlers to paginate copy blocks
  const handlePrevCopy = () => {
    if (!selectedBrand) return;
    setCurrentCopyIndex((idx) => Math.max(0, idx - 1));
  };

  const handleNextCopy = () => {
    if (!selectedBrand) return;
    const maxIdx = getCopyBlocks(selectedBrand).length - 1;
    setCurrentCopyIndex((idx) => Math.min(maxIdx, idx + 1));
  };

  // Move to a specific point and center it on screen
  const moveTo = (x: number, y: number) => {
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;

    const scaledX = x * initialScale;
    const scaledY = y * initialScale;

    const targetX = screenCenterX - scaledX;
    const targetY = screenCenterY - scaledY;

    if (transformRef.current) {
      transformRef.current.setTransform(targetX, targetY, initialScale);
    }
  };

  // Center after image loads and transform wrapper is ready
  useEffect(() => {
    if (imageLoaded && transformRef.current && !initialized) {
      const { x, y } = isZoomFly ? zoomFlyCoords : getDeviceCenterPosition();
      moveTo(x, y);
      setInitialized(true);
      setInitialPositionSet(true);
      // Hide loading overlay after a short delay
      setTimeout(() => setIsLoading(false), 100);
    }
  }, [imageLoaded, initialized]);

  // Prevent accidental pan on click (only allow if user dragged)
  const handleMouseDown = (e: React.MouseEvent) => {
    clickStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (clickStart.current) {
      const dx = Math.abs(e.clientX - clickStart.current.x);
      const dy = Math.abs(e.clientY - clickStart.current.y);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 5 && transformRef.current) {
        transformRef.current.resetTransform(); // Reset transform to prevent accidental pan
      }
    }
    clickStart.current = null;
  };

  // Text box style
  const textBoxStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: `${textBoxPosition.y / imageHeight * 100}%` as React.CSSProperties['top'],
    left: `${textBoxPosition.x / imageWidth * 100}%` as React.CSSProperties['left'],
    width: `${textBoxPosition.width}px` as React.CSSProperties['width'],
    height: `${textBoxPosition.height}px` as React.CSSProperties['height'],
    backgroundColor: 'transparent',
    padding: '8px' as React.CSSProperties['padding'],
    borderRadius: '8px' as React.CSSProperties['borderRadius'],
    zIndex: 10 as React.CSSProperties['zIndex'],
    display: 'flex' as React.CSSProperties['display'],
    alignItems: 'flex-start' as React.CSSProperties['alignItems'],
    justifyContent: 'flex-start' as React.CSSProperties['justifyContent'],
  };

  // Initial text style
  const initialTextStyle: React.CSSProperties = {
    fontSize: '25px',
    lineHeight: '1.5'
  };

  // Brand text style
  const brandTextStyle: React.CSSProperties = {
    fontSize: '19.5px',
    lineHeight: '1.3',
    whiteSpace: 'pre-wrap'
  };

  // Slideshow container style
  const slideshowContainerStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: `${slideshowPosition.y / imageHeight * 100}%` as React.CSSProperties['top'],
    left: `${slideshowPosition.x / imageWidth * 100}%` as React.CSSProperties['left'],
    width: `${slideshowPosition.width}px` as React.CSSProperties['width'],
    height: `${slideshowPosition.height}px` as React.CSSProperties['height'],
    backgroundColor: 'white',
    borderRadius: '8px' as React.CSSProperties['borderRadius'],
    display: 'flex' as React.CSSProperties['display'],
    flexDirection: 'column' as React.CSSProperties['flexDirection'],
    alignItems: 'center' as React.CSSProperties['alignItems'],
    justifyContent: 'center' as React.CSSProperties['justifyContent'],
    zIndex: 10 as React.CSSProperties['zIndex'],
  };

  // Slideshow image style
  const slideshowImageStyle: React.CSSProperties = {
    width: '100%' as React.CSSProperties['width'],
    height: '100%' as React.CSSProperties['height'],
    overflow: 'hidden' as React.CSSProperties['overflow'],
  };

  // Slideshow overlay style
  const overlayStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: `${slideshowPosition.y / imageHeight * 100}%` as React.CSSProperties['top'],
    left: `${slideshowPosition.x / imageWidth * 100}%` as React.CSSProperties['left'],
    width: `${slideshowPosition.width}px` as React.CSSProperties['width'],
    height: `${slideshowPosition.height}px` as React.CSSProperties['height'],
    backgroundColor: 'transparent',
    border: '0',
    overflow: 'hidden',
    zIndex: 11 as React.CSSProperties['zIndex'],
    pointerEvents: 'none',
    clipPath: overlayAnimation ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0)',
    transition: `clip-path 1.97s ease-in-out`,
    outline: 'none',
    boxShadow: 'none',
    willChange: 'clip-path' as React.CSSProperties['willChange'],
  };

  // Overlay image style
  const overlayImageStyle: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    top: 0,
    left: 0,
    width: '100%' as React.CSSProperties['width'],
    height: '100%' as React.CSSProperties['height'],
    objectFit: 'cover' as React.CSSProperties['objectFit'],
  };

  // Add the keyframes to the document
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes overlaySlide {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Render the overlay
  const renderOverlay = () => (
    <div style={overlayStyle}>
      <img
        src="/images/Slideshow Overlay.jpg"
        alt="Overlay"
        style={overlayImageStyle}
      />
    </div>
  );

  // Play sound effect
  const playSound = () => {
    const audio = new Audio('/A Stone Thrown In Water _ Sound Effects _ Water Sounds _ Human Sounds 4.mp3');
    audio.play().catch(console.error);
  };

  // Handle button click with overlay animation
  const handleBrandClick = (brand: string) => {
    playSound();
    setSelectedBrand(brand);
    
    // Only set hasPlayedAnimations to true if it hasn't been set before
    if (!hasPlayedAnimations) {
      setShowSlideshow(true);
      // overlay already visible from load; ensure it remains in DOM
      setShowOverlay(true);
      
      setHasPlayedAnimations(true);
      
      // Start overlay animation
      setTimeout(() => {
        setOverlayAnimation(true);
        
        // Hide overlay after animation completes
        setTimeout(() => {
          setShowOverlay(false);
          setOverlayAnimation(false);
        }, 2100);
      }, 1000);

      // Show eraser animation
      setShowEraserAnimation(true);
      
      // Set initial position
      setEraserPosition({
        top: `${850 / 5992 * 100}%`,
        left: `${5500 / 8472 * 100}%`,
        width: '667px',
        height: '230px',
      });

      // Remove animation after completion
      setTimeout(() => {
        setShowEraserAnimation(false);
      }, 4300);
    } else {
      // For subsequent clicks, just show the slideshow without the overlay
      setShowSlideshow(true);
    }
  };

  // Button style for central buttons
  const btnStyle = (top: string, left: string, color: string, rotate: string): React.CSSProperties => ({
    position: 'absolute',
    top,
    left,
    width: '120px',
    height: '60px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'black',
    fontWeight: 'bold',
    fontSize: '32px',
    fontFamily: 'WhiteboardFont, sans-serif',
    padding: '0 4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    opacity: 0.8,
    transform: `translate(-50%, -50%) rotate(${rotate})`,
    cursor: 'pointer'
  });

  // Return button style
  const returnBtnStyle = (top: string, left: string, color: string, width: string = '220px', height: string = '220px'): React.CSSProperties => ({
    position: 'absolute',
    top,
    left,
    width,
    height,
    backgroundColor: 'transparent',
    color: 'black',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '24px',
    fontFamily: 'WhiteboardFont, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    zIndex: 10,
    transform: 'translate(-50%, -50%)',
    transformOrigin: 'center',
  });

  // Hover text box style
  const hoverTextBoxStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${(582 + 5) / imageHeight * 100}%`,
    left: `${(1086 - 6) / imageWidth * 100}%`,
    width: '180px',
    height: '250px',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '8px',
    borderRadius: '4px',
    zIndex: 13,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    fontFamily: 'WhiteboardFont',
    fontSize: '18px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap'
  };

  // Hover item style
  const getHoverItemStyle = (item: { x: number; y: number; width: number; height: number; rotation?: number }) => {
    const style: React.CSSProperties = {
      position: 'absolute' as React.CSSProperties['position'],
      top: `${(item.y - item.height / 2) / imageHeight * 100}%` as React.CSSProperties['top'],
      left: `${(item.x - item.width / 2) / imageWidth * 100}%` as React.CSSProperties['left'],
      width: `${item.width}px` as React.CSSProperties['width'],
      height: `${item.height}px` as React.CSSProperties['height'],
      backgroundColor: 'transparent',
      display: 'flex' as React.CSSProperties['display'],
      alignItems: 'center' as React.CSSProperties['alignItems'],
      justifyContent: 'center' as React.CSSProperties['justifyContent'],
      cursor: 'pointer' as React.CSSProperties['cursor'],
      zIndex: 12 as React.CSSProperties['zIndex'],
      transition: 'opacity 0.2s ease',
      opacity: 1 as React.CSSProperties['opacity'],
      border: 'none',
    };

    return style;
  };

  // Handle hover
  const handleHover = (text: string) => {
    setHoveredItem(text);
  };

  const handleHoverLeave = () => {
    setHoveredItem(null);
  };

  // Render hover text
  const renderHoverText = () => {
    if (!hoveredItem) return null;
    return (
      <div style={hoverTextBoxStyle}>
        <p>{hoverTextContent[hoveredItem as keyof typeof hoverTextContent]}</p>
      </div>
    );
  };

  // Eraser animation style
  const eraserAnimation: React.CSSProperties = {
    position: 'absolute' as React.CSSProperties['position'],
    zIndex: 20 as React.CSSProperties['zIndex'],
    animation: 'eraserArc 3.8s linear',
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex' as React.CSSProperties['display'],
    alignItems: 'center' as React.CSSProperties['alignItems'],
    justifyContent: 'center' as React.CSSProperties['justifyContent'],
    opacity: 1 as React.CSSProperties['opacity'],
    transform: 'translateZ(0) rotate(-90deg)' as React.CSSProperties['transform'],
    transformOrigin: 'center' as React.CSSProperties['transformOrigin'],
    willChange: 'transform' as React.CSSProperties['willChange'],
  };

  // Add the keyframes to the document
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes eraserArc {
        0% { 
          top: ${850 / 5992 * 100}%; 
          left: ${5500 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        21.05% { 
          top: ${(970 + 120) / 5992 * 100}%; 
          left: ${7080 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        26.32% { 
          top: ${(890 + 120) / 5992 * 100}%; 
          left: ${7130 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        31.58% { 
          top: ${(1050 + 120) / 5992 * 100}%; 
          left: ${7230 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        36.84% { 
          top: ${(890 + 120) / 5992 * 100}%; 
          left: ${7330 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        42.11% { 
          top: ${(1050 + 120) / 5992 * 100}%; 
          left: ${7430 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        47.37% { 
          top: ${(890 + 120) / 5992 * 100}%; 
          left: ${7530 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        52.63% { 
          top: ${(1050 + 120) / 5992 * 100}%; 
          left: ${7630 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        62.11% { 
          top: ${(970 + 120) / 5992 * 100}%; 
          left: ${7680 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
        100% { 
          top: ${(970 + 120) / 5992 * 100}%; 
          left: ${8600 / 8472 * 100}%; 
          transform: translate(-50%, -50%) rotate(-90deg);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Eraser animation styles
  const eraserImageStyle: React.CSSProperties = {
    width: '100%' as React.CSSProperties['width'],
    height: '100%' as React.CSSProperties['height'],
    objectFit: 'contain' as React.CSSProperties['objectFit'],
  };

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sendButtonVisible, setSendButtonVisible] = useState(true);

  // Speech bubble position
  const speechBubblePosition = {
    x: 6773,  // Moved 30px to the right from 6743
    y: 4859,
    width: 300,
    height: 200
  };

  // Speech bubble container style
  const speechBubbleContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${speechBubblePosition.y / imageHeight * 100}%`,
    left: `${speechBubblePosition.x / imageWidth * 100}%`,
    width: `${speechBubblePosition.width}px`,
    height: `${speechBubblePosition.height}px`,
    zIndex: 15,
    pointerEvents: 'none',
    transform: 'rotate(4deg)',
    display: isSubmitted ? 'none' : 'block'
  };

  // Speech bubble image style
  const speechBubbleImageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1
  };

  // Speech bubble text style
  const speechBubbleTextStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '80%',
    height: '60%',
    fontFamily: 'WhiteboardFont',
    fontSize: '32px',  
    color: '#000000',
    zIndex: 2,
    padding: '10px',
    pointerEvents: 'none'
  };

  // Contact form container style
  const contactFormStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${4893 / imageHeight * 100}%`,
    left: `${7275 / imageWidth * 100}%`,
    width: '300px',
    height: '450px',
    backgroundColor: 'transparent',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: 'none',
    zIndex: 15,
    pointerEvents: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontFamily: 'WhiteboardFont',
    boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
    cursor: 'text',
    border: 'none',
    transform: 'rotate(4deg)',
  };

  // Input field style
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: 'none',
    fontSize: '20px',
    color: '#333',
    background: 'transparent',
    WebkitUserSelect: 'text',
    MozUserSelect: 'text',
    msUserSelect: 'text',
    userSelect: 'text',
    pointerEvents: 'auto',
    touchAction: 'none',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    fontFamily: 'WhiteboardFont',
    transform: 'rotate(4deg)',
  };

  // Textarea style
  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    height: '230px',
    resize: 'none',
    overflow: 'auto',
    transform: 'translate(-20px, 10px) rotate(8deg)',
  };

  // Handle form input changes
  const handleInputChange = (field: keyof typeof contactForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newForm = { ...contactForm, [field]: event.target.value };
    setContactForm(newForm);
    validateForm(newForm);
  };

  // Validate form
  const validateForm = (form: typeof contactForm) => {
    const isValid = form.name.trim() !== '' && 
                   form.email.trim() !== '' && 
                   form.message.trim() !== '';
    setIsFormValid(isValid);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid || isSending) return;

    setIsSending(true);
    
    // Play sound effect
    const audio = new Audio('/Website Crow Sound Effect 4.mp3');
    audio.play().catch(console.error);

    try {
      // Log the request body
      console.log('Sending form data:', contactForm);

      // Send form data to backend
      const response = await fetch('https://api.johnclose.ie/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm)
      });

      // Log the response status
      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      // Show success message
      setShowSuccessMessage(true);
      setContactForm({ name: '', email: '', message: '' });
      setIsFormValid(false);
      setIsSubmitted(true);
      setSendButtonVisible(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      alert('Failed to send message. Please try again later.\n\nError details: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSending(false);
    }
  };

  // Success message style
  const successMessageStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${4893 / imageHeight * 100}%`,
    left: `${7323 / imageWidth * 100}%`,
    width: '250px',
    height: '300px',
    backgroundColor: 'transparent',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: 'none',
    zIndex: 15,
    pointerEvents: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontFamily: 'WhiteboardFont',
    boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
    cursor: 'text',
    border: 'none',
    transform: 'rotate(10deg)',
  };

  // Success message text style
  const successMessageTextStyle: React.CSSProperties = {
    fontSize: '30px',
    color: '#333',
    textAlign: 'center' as React.CSSProperties['textAlign'],
    fontFamily: 'WhiteboardFont',
    margin: 'auto',
    lineHeight: '1.5',
  };

  // Send button style
  const sendButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${5083 / imageHeight * 100}%`,
    left: `${6710 / imageWidth * 100}%`,
    width: '260px',
    height: '217px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    transition: 'background-color 0.3s ease',
    zIndex: 15,
    pointerEvents: 'auto',
    transform: 'translate(-50%, -50%)',
    fontFamily: 'WhiteboardFont',
    display: 'flex',
    padding: 0,
  };

  // Send button image style
  const sendButtonImageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
  };

  // Define text box type
  interface TextBox {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    text?: string;
  }

  // Text box positions
  const textBoxes: TextBox[] = [
    { 
      name: 'About', 
      x: 1052, 
      y: 1057, 
      width: 265, 
      height: 174, 
      rotation: 0,
      text: "Hi there, I'm John Close.\n\nI've been a copywriter at Verve|Showrunner since 2022.\n\nPet my dog, and I'll tell you more about me."
    },
    { 
      name: 'Telescope', 
      x: 1468, 
      y: 1155, 
      width: 80, 
      height: 33, 
      rotation: 40,
      text: "Award Scope"
    },
    { 
      name: 'Turn Back', 
      x: 2190, 
      y: 4573, 
      width: 120, 
      height: 45, 
      rotation: -17,
      text: "Danger!\nTurn Back!"
    },
    { 
      name: 'Comedy Section', 
      x: 1240, 
      y: 5407, 
      width: 155, 
      height: 80, 
      rotation: 0,
      text: "Click the projector to check out my comedy."
    },
    { 
      name: 'Work Sign', 
      x: 7252, 
      y: 1372, 
      width: 156, 
      height: 82, 
      rotation: 0,
      text: "Chuck a Stone in and watch work ripple to the surface."
    },
    { 
      name: 'Zoom Wizard', 
      x: 4531, 
      y: 5127, 
      width: 95, 
      height: 80, 
      rotation: 0,
      text: isZoomFly ? "Enjoy flying about!" : "Wish you could zoom out?\n\nTake this!"
    }
  ];

  // About text pieces
  const aboutTexts = [
    "Hi there, I'm John Close.\n\nI've been a copywriter at Verve|Showrunner since 2022.\n\nPet my dog, and I'll tell you more about me.",
    "Good work! Now...",
    "I'm a copywriter for money. And for love.\n\nBut mostly for money.",
    "I like my work to be enjoyable and honest.\n\nLike that bit about the money.",
    "I also like to create ads that are smart and simple.\n\nThat way, people actually enjoy them and they stay great quality.",
    "It's the only way I can feel good about my ideas when friends and family ask about them.",
    "Particularly my niece...\n\nShe's too young to know polite from cutthroat.\n\nMy doodle may be smiling, but the writer behind it is wincing at the thought.",
    "Now, many great advertisers aim for honest, smart, simple work.\n\nBut these are the things that really set me apart:",
    "My 'yes and' attitude to ideas.\n\nBrave the 'Danger' section, and you'll see I'm a dedicated improviser.",
    "My delightful golden retriever energy.\n\nMessage me for a coffee and you'll get the picture.\n\nAnd hopefully want to work with me.",
    "Finally, I'll go the distance to bring an idea to life.\n\nWhether it's learning new skills or working on the weekend.",
    "Just take this whiteboard website. I'm not a coder or a designer.\n\nThis is all DIY, baby!",
    "Anyway, I'm proud to say this has led me to a fair few awards.\n\nHover over them in the sky above for more details on what I've won.",
    "And if you want to see the work they're for, head over to my work section.",
    "Oh, you want me to say all this again?\n\nWell... if you insist."
  ];

  // State for current text index
  const [currentAboutIndex, setCurrentAboutIndex] = useState(0);

  // Handle button click
  const handleDogClick = () => {
    setCurrentAboutIndex((prevIndex) => (prevIndex + 1) % aboutTexts.length);
  };

  // Text box style
  const textBoxStyle2: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'transparent', 
    border: 'none',
    boxShadow: 'none',
    fontFamily: 'WhiteboardFont',
    color: '#000000',
    pointerEvents: 'none',
    zIndex: 10,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '2px 4px',
    cursor: 'default',
    whiteSpace: 'pre-line'
  };

  // Button style
  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    width: '225px',
    height: '130px',
    backgroundColor: 'transparent',
    borderRadius: '25px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: '1410px',
    left: '1327px',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    transition: 'background-color 0.3s ease',
  };

  // Button hover style
  const buttonHoverStyle: React.CSSProperties = {
    backgroundColor: '#FFA500',
  };

  // Comedy slideshow configuration
  const comedySlideshow = {
    slides: [
      { url: 'https://lh3.googleusercontent.com/d/18IukjC7Bfj0fEovg9T-tkZnDwGlnlONH', type: 'image' },
      { url: 'https://drive.google.com/file/d/1uXkXPzRdHxyh3w6jG30wHA1Ui5xzDNnu/preview', type: 'video' },
      { url: 'https://lh3.googleusercontent.com/d/1nXenwLfnnvjmA3R4PUyhwJSB2r5t23AM', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1lDPGyQymQ4ASZ9O7c37Vewzy8grrzXil', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1coWXwzX0e0kcCO4aseFXaSVZnMB7yCoi', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1BWL2gTrk29mYswZqgrrIhCDQ3EV1cxJ1', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1yJcB1RMX1g6BFIXHVuAC9KXB7RV4HWBI', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1I70Z61a_3w7sY5rdcOpDWh8gSYV8Wfum', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/11b6Osj9KAHEchHe3ElMu1EGgFOb5rMRr', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1LE8zRTJd81AUDZ3BGoU2hn-VJSIQhbjK', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/13D4OPBrmEtT-9ZojVhJE2ibNPxrSCEKY', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1ZrST0o-HkQCjeXmyotViK0bskSdfGdFB', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1OWZ1a8XEp0Y1-6kAXWvJ-q39SHvX48zv', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1Jm5iAgRKV6Q8NPnlAORnxu8hb7xeInkn', type: 'image' },
      { url: 'https://lh3.googleusercontent.com/d/1tU6griG5MkEjJP1g02-qpeLJCclN0imy', type: 'image' }
    ] as { url: string; type: 'video' | 'image' }[],
    x: 888,
    y: 5084, // 5124 - 40
    width: 400,
    height: 240  // 200 + 40
  };

  // Comedy button position
  const comedyButtonPosition = {
    x: 1046,
    y: 5454,
    width: 130,
    height: 100
  };

  // Add zoom handling
  const [zoomLevel, setZoomLevel] = useState(initialScale);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    // Get the container dimensions
    const container = document.querySelector('#root');
    if (container) {
      setContainerWidth(container.clientWidth);
      setContainerHeight(container.clientHeight);
    }

    // Calculate optimal zoom level based on container size
    const calculateOptimalZoom = () => {
      const containerAspect = containerWidth / containerHeight;
      const imageAspect = imageWidth / imageHeight;
      
      // Calculate the zoom level that maintains the aspect ratio
      let zoom = 1.0;
      if (containerAspect > imageAspect) {
        // Container is wider than the image
        zoom = containerHeight / imageHeight;
      } else {
        // Container is taller than the image
        zoom = containerWidth / imageWidth;
      }
      
      // Apply a minimum zoom level to ensure the image is visible
      const minZoom = 0.5;
      const maxZoom = 1.5;
      const optimalZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
      
      setZoomLevel(optimalZoom);
    };

    // Calculate initial zoom
    calculateOptimalZoom();

    // Recalculate zoom on window resize
    const handleResize = () => {
      if (container) {
        setContainerWidth(container.clientWidth);
        setContainerHeight(container.clientHeight);
        calculateOptimalZoom();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerWidth, containerHeight]);

  // Update TransformWrapper configuration
  const transformWrapperStyle: React.CSSProperties = {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  };

  // Loading overlay style
  const loadingOverlayStyle: React.CSSProperties = {
    position: 'fixed' as React.CSSProperties['position'],
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'white',
    zIndex: 10000,
    pointerEvents: 'none',
  };

  // constants
  const keyboardPanStep = 120; // tune as desired

  // Add arrow-key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!transformRef.current) return;
      const state = transformRef.current.state || (transformRef.current as any).transformState;
      if (!state) return;
      const { positionX, positionY, scale } = state;

      let dx = 0;
      let dy = 0;
      switch (e.key) {
        case 'ArrowUp':
          dy = keyboardPanStep;
          break;
        case 'ArrowDown':
          dy = -keyboardPanStep;
          break;
        case 'ArrowLeft':
          dx = keyboardPanStep;
          break;
        case 'ArrowRight':
          dx = -keyboardPanStep;
          break;
        default:
          return; // exit if not arrow key
      }
      // Adjust movement relative to current scale to keep visual distance similar
      const adjustedDX = dx / scale;
      const adjustedDY = dy / scale;
      transformRef.current.setTransform(positionX + adjustedDX, positionY + adjustedDY, scale);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Helper to render copy block with dynamic typography ---
  const renderCopyBlock = (brand: string) => {
    const blocks = getCopyBlocks(brand);
    if (!blocks.length) return null;
    const safeIndex = Math.min(currentCopyIndex, blocks.length - 1);
    const copy = blocks[safeIndex];
    const lines = copy.split('\n');

    // First slide styling
    if (currentCopyIndex === 0) {
      const brandName = lines[0] || '';
      const projectName = lines[1] || '';
      const rest = lines.slice(2).join('\n');
      return (
        <section style={{ whiteSpace: 'pre-wrap' }}>
          <h1 style={{ fontSize: '27.5px', fontWeight: 'bold', margin: 0 }}>{brandName}</h1><br/>
          <h2 style={{ fontSize: '24.5px', fontWeight: 'bold', margin: 0 }}>{projectName}</h2><br/><br/><br/>
          <p style={{ fontSize: '21.5px', margin: 0 }}>{rest}</p>
        </section>
      );
    }

    // Subsequent slides styling
    const title = lines[0] || '';
    const body = lines.slice(1).join('\n');
    return (
      <section style={{ whiteSpace: 'pre-wrap' }}>
        <h3 style={{ fontSize: '24.5px', fontWeight: 'bold', margin: 0 }}>{title}</h3><br/><br/>
        <p style={{ fontSize: '21.5px', margin: 0 }}>{body}</p>
      </section>
    );
  };

  // --- Typewriter text states ---
  const typewriterMessages = isZoomFly
    ? [
        'Well done finding the wizard. If you’re really bored test out the contact form.'
      ]
    : [
        'Welcome to my whiteboard\nad portfolio.\nDrag around to explore.',
        'Also keep your eyes open for the wizard that lets you zoom out.',
        'advertising, copywriting, creative, strategy, direction, writing, ideation.'
      ];

  const [typeMsgIndex, setTypeMsgIndex] = useState(0);
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    const currentMessage = typewriterMessages[typeMsgIndex];
    if (!currentMessage) return;

    const typingDuration = 4000; // ms per message typing
    const holdDuration = 5000; // ms to hold after fully typed
    const intervalMs = typingDuration / currentMessage.length;

    let charIndex = 0;
    setTypedText('');

    const typeInterval = setInterval(() => {
      charIndex += 1;
      setTypedText(currentMessage.slice(0, charIndex));

      if (charIndex >= currentMessage.length) {
        clearInterval(typeInterval);
        setTimeout(() => {
            setTypeMsgIndex((idx) => (idx + 1) % typewriterMessages.length);
          }, holdDuration);
      }
    }, intervalMs);

    return () => clearInterval(typeInterval);
  }, [typeMsgIndex]);

  return (
    <>
      {isLoading && (
        <div style={loadingOverlayStyle} />
      )}
      
      <main role="main" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <TransformWrapper
          ref={transformRef}
          initialScale={initialScale}
          minScale={minScaleValue}
          maxScale={3}
          centerOnInit={false}
          limitToBounds={true}
          panning={{
            disabled: false,
            velocityDisabled: false,
            allowLeftClickPan: true,
            excluded: ['input', 'textarea', 'button']
          }}
          doubleClick={{ disabled: true }}
          pinch={{ disabled: !isZoomFly, step: 0.15 }}
          wheel={{ disabled: !isZoomFly, step: 35 }}
          velocityAnimation={{ animationTime: 250, sensitivity: 0.4, equalToMove: false, disabled: false }}
          onPanningStart={() => setIsDragging(true)}
          onPanningStop={() => setIsDragging(false)}
        >
          <TransformComponent
            wrapperStyle={{
              width: '100%',
              height: '100%',
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            contentStyle={{
              width: `${imageWidth}px`,
              height: `${imageHeight}px`,
              position: 'relative',
              backgroundColor: '#fff',
            }}
          >
            <div
              style={{
                width: imageWidth,
                height: imageHeight,
                position: 'relative',
              }}
            >
              {/* Text Box */}
              <div style={textBoxStyle}>
                {!selectedBrand ? (
                  <div style={initialTextStyle}>
                    <h2>Pick a piece of work.</h2>
                    <p>I'll tell you what the hook is.</p>
                  </div>
                ) : (
                  <div style={{ ...brandTextStyle, position: 'relative', height: '100%', overflow: 'auto', paddingTop: '16px' }}>
                    {selectedBrand && renderCopyBlock(selectedBrand)}

                    {/* Arrow navigation – show only if multiple copy blocks */}
                    {selectedBrand && getCopyBlocks(selectedBrand).length > 1 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        display: 'flex',
                        gap: '6px',
                        pointerEvents: 'auto'
                      }}>
                        <button
                          onClick={handlePrevCopy}
                          disabled={currentCopyIndex === 0}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '20px',
                            cursor: currentCopyIndex === 0 ? 'default' : 'pointer',
                            opacity: currentCopyIndex === 0 ? 0.3 : 0.8,
                            fontFamily: 'WhiteboardFont'
                          }}
                        >
                          <img src="/images/ArrowLeft.png" alt="Left" style={{ width: '24px', height: '24px' }} />
                        </button>
                        <button
                          onClick={handleNextCopy}
                          disabled={currentCopyIndex === getCopyBlocks(selectedBrand).length - 1}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '20px',
                            cursor: currentCopyIndex === getCopyBlocks(selectedBrand).length - 1 ? 'default' : 'pointer',
                            opacity: currentCopyIndex === getCopyBlocks(selectedBrand).length - 1 ? 0.3 : 0.8,
                            fontFamily: 'WhiteboardFont'
                          }}
                        >
                          <img src="/images/ArrowRight.png" alt="Right" style={{ width: '24px', height: '24px' }} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Slideshow */}
              {showSlideshow && selectedBrand && (
                <div style={{
                  position: 'absolute',
                  top: `${slideshowPosition.y / imageHeight * 100}%`,
                  left: `${slideshowPosition.x / imageWidth * 100}%`,
                  width: `${slideshowPosition.width}px`,
                  height: `${slideshowPosition.height}px`,
                  zIndex: 10,
                }}>
                  <GoogleDriveSlideshow
                    slides={brandContent[selectedBrand].slides}
                    autoPlay={true}
                    autoPlayInterval={5000}
                    showControls={true}
                    showNavigation={true}
                    showTitle={false}
                    showDescription={false}
                    width="100%"
                    height="100%"
                    className="slideshow-container"
                    onSlideChange={(slideIndex) => setCurrentSlide(slideIndex)}
                  />
                </div>
              )}
              {showOverlay && renderOverlay()}
              <img
                src={isZoomFly ? "/Whiteboard Portfolio Zoomfly.jpg" : "/Whiteboard Portfolio Main.jpg"}
                alt="John Close's interactive whiteboard portfolio showcasing creative copywriting campaigns for Tayto, Lyons, Aer Lingus, Kerry Group, Certa, Headstuff and Whack"
                style={{
                  width: imageWidth,
                  height: imageHeight,
                  position: 'absolute' as React.CSSProperties['position'],
                  top: 0,
                  left: 0,
                  cursor: isDragging ? 'grabbing' as React.CSSProperties['cursor'] : 'grab' as React.CSSProperties['cursor'],
                }}
                onLoad={() => setImageLoaded(true)}
              />

              {/* New Text Boxes */}
              <div
                style={{
                  position: 'absolute',
                  top: `${2974 / 5992 * 100}%`,
                  left: `${3491 / 8472 * 100}%`,
                  width: '275px', // Increased width by 15px
                  height: '110px',
                  pointerEvents: 'none',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontFamily: 'WhiteboardFont',
                  color: '#000000',
                  fontSize: '23px',
                  lineHeight: '1.4',
                  letterSpacing: '1px',
                  fontWeight: 'bold'
                }}
              >
                {typedText}
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: `${3042 / imageHeight * 100}%`,
                  left: `${4007 / imageWidth * 100}%`,
                  width: '150px',
                  height: '80px',
                  pointerEvents: 'none',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontFamily: 'WhiteboardFont',
                  color: '#000000',
                  fontSize: '27px', // Increased font size
                  lineHeight: '1.5',
                  fontWeight: 'bold' // Added bold styling
                }}
              >
                John Close<br/>
                Copywriter
              </div>

              {/* Social Media Links */}
              <a
                href="https://www.instagram.com/johncloseinbriefs/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: 'absolute',
                  top: `${(5244 - (120 / 2)) / 5992 * 100}%`,
                  left: `${(6894 - (120 / 2)) / 8472 * 100}%`,
                  width: '120px',
                  height: '120px',
                  pointerEvents: 'auto',
                  zIndex: 10,
                  cursor: 'pointer'
                }}
              />

              <a
                href="https://www.linkedin.com/in/john-close/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: 'absolute',
                  top: `${(5246 - (130 / 2)) / 5992 * 100}%`,
                  left: `${(7024 - (110 / 2)) / 8472 * 100}%`,
                  width: '110px',
                  height: '130px',
                  pointerEvents: 'auto',
                  zIndex: 10,
                  cursor: 'pointer'
                }}
              />

              {/* Navigation Buttons */}
              <button
                style={btnStyle('46.783%', '47.299%', 'red', '16deg')}
                onClick={() => moveTo(1252, 1257)}
              >
                About
              </button>

              <button
                style={btnStyle('48.806%', '47.236%', 'blue', '-17deg')}
                onClick={() => moveTo(930, 5320)}
              >
                Danger
              </button>

              <button
                style={btnStyle('47.936%', '49.236%', 'green', '16deg')}
                onClick={() => moveTo(6850, 5075)}
              >
                Contact
              </button>

              <button
                style={btnStyle('45.396%', '49.256%', 'yellow', '-18deg')}
                onClick={() => moveTo(7272, 1231)}
              >
                Work
              </button>

              {/* ZoomFly Button */}
              <button
                style={{
                  position: 'absolute',
                  top: `${zoomFlyCoords.y / imageHeight * 100}%`,
                  left: `${zoomFlyCoords.x / imageWidth * 100}%`,
                  width: '80px',
                  height: '70px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: isZoomFly ? 'black' : 'transparent',
                  fontWeight: 'bold',
                  fontSize: '48px',
                  fontFamily: 'WhiteboardFont, sans-serif',
                  transform: 'translate(-50%, -50%)',
                  display: isZoomFly ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                }}
                onClick={() => (window.location.href = '/zoomfly')}
              >
                !
              </button>

              {/* Return Buttons */}
              <button
                style={returnBtnStyle('17.55%', '19.3%', 'purple', '230px', '230px')} 
                onClick={() => moveTo(4070, 2990)}
              >
                Return
              </button>

              <button
                style={returnBtnStyle('90.85%', '9.53%', 'purple', '260px', '260px')}
                onClick={() => moveTo(4070, 2990)}
              >
                Return
              </button>

              <button
                style={returnBtnStyle('78.47%', '84.84%', 'purple', '260px', '260px')}
                onClick={() => moveTo(4070, 2990)}
              >
                Return
              </button>

              <button
                style={returnBtnStyle('19.66%', '77.95%', 'purple', '260px', '260px')}
                onClick={() => moveTo(4070, 2990)}
              >
                Return
              </button>

              {/* Brand Buttons */}
              {brandButtons.map((brand) => (
                <button
                  key={brand.text}
                  onClick={() => handleBrandClick(brand.text)}
                  aria-label={`View ${brand.text} campaign portfolio`}
                  title={`Click to explore ${brand.text} advertising campaigns`}
                  style={{
                    position: 'absolute',
                    top: `${brand.y / imageHeight * 100}%`,
                    left: `${brand.x / imageWidth * 100}%`,
                    width: `${brand.width}px`,
                    height: `${brand.height}px`,
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '50%',
                    color: 'black',
                    fontWeight: 'bold',
                    fontSize: '32px',
                    fontFamily: 'WhiteboardFont, sans-serif',
                    padding: '0 4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.2s ease, transform 0.2s ease',
                    opacity: 0.8,
                    transform: `translate(-50%, -50%) rotate(0deg)`,
                    cursor: 'pointer'
                  }}
                />
              ))}
              {/* Hoverable Items */}
              {hoverableItems.map((item) => (
                <button
                  key={item.text}
                  onMouseOver={() => handleHover(item.text)}
                  onMouseLeave={handleHoverLeave}
                  style={getHoverItemStyle(item)}
                />
              ))}
              {/* Hover Text Box */}
              {renderHoverText()}
              {/* Eraser Animation */}
              {showEraserAnimation && (
                <div
                  style={{
                    ...eraserAnimation,
                    top: eraserPosition.top,
                    left: eraserPosition.left,
                    width: eraserPosition.width,
                    height: eraserPosition.height,
                  }}
                >
                  <img
                    src="/images/eraser.png"
                    alt="Eraser"
                    style={eraserImageStyle}
                  />
                </div>
              )}
              {/* Text Boxes */}
              {textBoxes.map((box) => (
                <div
                  key={box.name}
                  style={{
                    ...textBoxStyle2,
                    width: `${box.width}px`,
                    height: `${box.height}px`,
                    top: `${box.y / imageHeight * 100}%`,
                    left: `${box.x / imageWidth * 100}%`,
                    transform: `rotate(${box.rotation}deg)`,
                    fontSize: box.name === 'Telescope' || box.name === 'Work Sign' || box.name === 'Zoom Wizard' 
                      ? '20px' 
                      : box.name === 'Turn Back' 
                        ? '24px' 
                        : '24px'
                  }}
                >
                  {box.name === 'About' ? aboutTexts[currentAboutIndex] : <span style={{ fontSize: '20px' }}>{box.text}</span>}
                </div>
              ))}
              {/* Speech Bubble */}
              {!isSubmitted && (
                <div style={speechBubbleContainerStyle}>
                  <img 
                    src="/images/speechbubble.png" 
                    alt="Speech Bubble" 
                    style={speechBubbleImageStyle}
                  />
                  <div style={speechBubbleTextStyle}>
                    click me when you've written your message
                  </div>
                </div>
              )}
              {/* Contact Form */}
              <div style={contactFormStyle}>
                {isSubmitted ? null : (
                  <>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleInputChange('name')}
                      placeholder="Name"
                      style={inputStyle}
                    />
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleInputChange('email')}
                      placeholder="Email"
                      style={inputStyle}
                    />
                    <textarea
                      name="message"
                      value={contactForm.message}
                      onChange={handleInputChange('message')}
                      placeholder="Message"
                      style={textareaStyle}
                    />
                  </>
                )}
              </div>
              {sendButtonVisible && (
                <button
                  onClick={handleSubmit}
                  style={sendButtonStyle}
                >
                  <img
                    src={process.env.NODE_ENV === 'production' ? '/RavenOverlay.png' : 'ravenoverlay.png'}
                    alt="Send"
                    style={sendButtonImageStyle}
                  />
                </button>
              )}
              {showSuccessMessage && (
                <div style={successMessageStyle}>
                  <p style={successMessageTextStyle}>
                    Thank You!<br/>
                    The Raven Will Deliver Your Message.
                  </p>
                </div>
              )}
              {/* Button */}
              <button
                style={{
                  ...buttonStyle,
                }}
                onClick={handleDogClick}
              >
                Pet Dog
              </button>
              {/* Comedy Slideshow */}
              <ComedySlideshow
                slides={comedySlideshow.slides}
                x={comedySlideshow.x}
                y={comedySlideshow.y}
                width={comedySlideshow.width}
                height={comedySlideshow.height}
              />
              {/* Comedy Button */}
              <button
                style={{
                  position: 'absolute',
                  top: `${comedyButtonPosition.y / 5992 * 100}%`,
                  left: `${comedyButtonPosition.x / 8472 * 100}%`,
                  width: `${comedyButtonPosition.width}px`,
                  height: `${comedyButtonPosition.height}px`,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  zIndex: 10
                }}
                onClick={() => {
                  // This will be handled by the ComedySlideshow component
                }}
              >
                {/* Button content will be added later */}
              </button>
            </div>
          </TransformComponent>
        </TransformWrapper>
      </main>
    </>
  );
};

export default App;
