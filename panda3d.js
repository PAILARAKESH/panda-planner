/* ================================================
   PandaTravel AI — 3D Panda Avatar (Three.js)
   ================================================ */

let scene, camera, renderer, pandaGroup;
let mixer, clock;
let currentState = 'idle';
let breatheAngle = 0;
let waveAngle = 0;
let headTilt = 0;
let mouthOpen = 0;
let eyeScale = 1;
let bounceOffset = 0;

// Color palette
const COLORS = {
    black: 0x1a1a2e,
    darkGray: 0x2d2d44,
    white: 0xf0f0f0,
    cream: 0xe8e0d8,
    pink: 0xffb6c1,
    blushPink: 0xff8fa3,
    nose: 0x1a1a2e,
    eyeWhite: 0xffffff,
    pupil: 0x0a0a15,
    sparkle: 0xffffff,
    bow: 0xff4f81,
    bowDark: 0xd4365e,
    accent: 0x818cf8,
};

function initPanda3D(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 8);
    camera.lookAt(0, 0.5, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(3, 5, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(COLORS.accent, 0.3);
    rimLight.position.set(-3, 2, -3);
    scene.add(rimLight);

    const bottomLight = new THREE.DirectionalLight(0x818cf8, 0.15);
    bottomLight.position.set(0, -3, 2);
    scene.add(bottomLight);

    // Build the Panda
    pandaGroup = new THREE.Group();
    buildPanda(pandaGroup);
    scene.add(pandaGroup);

    // Clock
    clock = new THREE.Clock();

    // Handle resize
    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    // Start animation loop
    animate();
}

function buildPanda(group) {
    // ===== BODY (Torso) =====
    const bodyGeo = new THREE.SphereGeometry(1, 32, 32);
    bodyGeo.scale(0.85, 1, 0.75);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: COLORS.white,
        roughness: 0.4,
        metalness: 0.05,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, -0.3, 0);
    body.castShadow = true;
    body.name = 'body';
    group.add(body);

    // Belly patch
    const bellyGeo = new THREE.SphereGeometry(0.55, 32, 32);
    bellyGeo.scale(1, 1.1, 0.3);
    const bellyMat = new THREE.MeshStandardMaterial({
        color: COLORS.cream,
        roughness: 0.5,
    });
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.set(0, -0.25, 0.45);
    group.add(belly);

    // ===== HEAD =====
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.1, 0);
    headGroup.name = 'headGroup';
    group.add(headGroup);

    const headGeo = new THREE.SphereGeometry(0.9, 32, 32);
    headGeo.scale(1, 0.92, 0.88);
    const headMat = new THREE.MeshStandardMaterial({
        color: COLORS.white,
        roughness: 0.35,
        metalness: 0.05,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.castShadow = true;
    head.name = 'head';
    headGroup.add(head);

    // ===== EARS =====
    const earGeo = new THREE.SphereGeometry(0.32, 24, 24);
    const earMat = new THREE.MeshStandardMaterial({
        color: COLORS.black,
        roughness: 0.5,
    });

    const earL = new THREE.Mesh(earGeo, earMat);
    earL.position.set(-0.6, 0.7, -0.1);
    earL.name = 'earL';
    headGroup.add(earL);

    const earR = new THREE.Mesh(earGeo, earMat);
    earR.position.set(0.6, 0.7, -0.1);
    earR.name = 'earR';
    headGroup.add(earR);

    // Inner ears (pink)
    const innerEarGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const innerEarMat = new THREE.MeshStandardMaterial({
        color: COLORS.pink,
        roughness: 0.6,
    });
    const innerEarL = new THREE.Mesh(innerEarGeo, innerEarMat);
    innerEarL.position.set(-0.6, 0.72, 0.12);
    headGroup.add(innerEarL);

    const innerEarR = new THREE.Mesh(innerEarGeo, innerEarMat);
    innerEarR.position.set(0.6, 0.72, 0.12);
    headGroup.add(innerEarR);

    // ===== EYE PATCHES (black patches around eyes) =====
    const patchGeo = new THREE.SphereGeometry(0.3, 24, 24);
    patchGeo.scale(1.1, 1, 0.5);
    const patchMat = new THREE.MeshStandardMaterial({
        color: COLORS.black,
        roughness: 0.5,
    });

    const patchL = new THREE.Mesh(patchGeo, patchMat);
    patchL.position.set(-0.32, 0.08, 0.6);
    patchL.rotation.z = 0.15;
    headGroup.add(patchL);

    const patchR = new THREE.Mesh(patchGeo, patchMat);
    patchR.position.set(0.32, 0.08, 0.6);
    patchR.rotation.z = -0.15;
    headGroup.add(patchR);

    // ===== EYES =====
    // Eye whites
    const eyeWhiteGeo = new THREE.SphereGeometry(0.16, 24, 24);
    const eyeWhiteMat = new THREE.MeshStandardMaterial({
        color: COLORS.eyeWhite,
        roughness: 0.1,
        metalness: 0.05,
    });

    const eyeGroupL = new THREE.Group();
    eyeGroupL.position.set(-0.32, 0.1, 0.72);
    eyeGroupL.name = 'eyeGroupL';
    headGroup.add(eyeGroupL);

    const eyeWhiteL = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeGroupL.add(eyeWhiteL);

    const eyeGroupR = new THREE.Group();
    eyeGroupR.position.set(0.32, 0.1, 0.72);
    eyeGroupR.name = 'eyeGroupR';
    headGroup.add(eyeGroupR);

    const eyeWhiteR = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeGroupR.add(eyeWhiteR);

    // Pupils (big cute anime-style)
    const pupilGeo = new THREE.SphereGeometry(0.1, 24, 24);
    const pupilMat = new THREE.MeshStandardMaterial({
        color: COLORS.pupil,
        roughness: 0.1,
    });

    const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
    pupilL.position.set(0, 0, 0.08);
    pupilL.name = 'pupilL';
    eyeGroupL.add(pupilL);

    const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
    pupilR.position.set(0, 0, 0.08);
    pupilR.name = 'pupilR';
    eyeGroupR.add(pupilR);

    // Eye sparkles
    const sparkleGeo = new THREE.SphereGeometry(0.03, 12, 12);
    const sparkleMat = new THREE.MeshBasicMaterial({ color: COLORS.sparkle });

    const sparkleL = new THREE.Mesh(sparkleGeo, sparkleMat);
    sparkleL.position.set(0.04, 0.04, 0.16);
    eyeGroupL.add(sparkleL);

    const sparkleR = new THREE.Mesh(sparkleGeo, sparkleMat);
    sparkleR.position.set(0.04, 0.04, 0.16);
    eyeGroupR.add(sparkleR);

    // Small secondary sparkle
    const sparkle2Geo = new THREE.SphereGeometry(0.015, 8, 8);
    const sparkle2L = new THREE.Mesh(sparkle2Geo, sparkleMat);
    sparkle2L.position.set(-0.03, -0.02, 0.16);
    eyeGroupL.add(sparkle2L);

    const sparkle2R = new THREE.Mesh(sparkle2Geo, sparkleMat);
    sparkle2R.position.set(-0.03, -0.02, 0.16);
    eyeGroupR.add(sparkle2R);

    // ===== NOSE =====
    const noseGeo = new THREE.SphereGeometry(0.08, 16, 16);
    noseGeo.scale(1.3, 1, 1);
    const noseMat = new THREE.MeshStandardMaterial({
        color: COLORS.nose,
        roughness: 0.3,
    });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, -0.1, 0.85);
    headGroup.add(nose);

    // ===== MOUTH =====
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.22, 0.78);
    mouthGroup.name = 'mouthGroup';
    headGroup.add(mouthGroup);

    // Mouth shape (torus for smile)
    const mouthGeo = new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI);
    const mouthMat = new THREE.MeshStandardMaterial({
        color: COLORS.black,
        roughness: 0.5,
    });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.rotation.x = Math.PI;
    mouth.name = 'mouth';
    mouthGroup.add(mouth);

    // Open mouth (for talking — hidden by default)
    const openMouthGeo = new THREE.SphereGeometry(0.08, 16, 16);
    openMouthGeo.scale(1.2, 0.6, 0.5);
    const openMouthMat = new THREE.MeshStandardMaterial({
        color: 0x3a0a0a,
        roughness: 0.8,
    });
    const openMouth = new THREE.Mesh(openMouthGeo, openMouthMat);
    openMouth.position.set(0, -0.02, 0.02);
    openMouth.scale.set(1, 0, 1);
    openMouth.name = 'openMouth';
    mouthGroup.add(openMouth);

    // Tiny tongue inside open mouth
    const tongueGeo = new THREE.SphereGeometry(0.04, 12, 12);
    tongueGeo.scale(1.3, 0.6, 1);
    const tongueMat = new THREE.MeshStandardMaterial({
        color: 0xff6b8a,
        roughness: 0.6,
    });
    const tongue = new THREE.Mesh(tongueGeo, tongueMat);
    tongue.position.set(0, -0.04, 0.03);
    tongue.scale.set(1, 0, 1);
    tongue.name = 'tongue';
    mouthGroup.add(tongue);

    // ===== BLUSH =====
    const blushGeo = new THREE.SphereGeometry(0.12, 16, 16);
    blushGeo.scale(1.2, 0.6, 0.3);
    const blushMat = new THREE.MeshStandardMaterial({
        color: COLORS.blushPink,
        roughness: 0.8,
        transparent: true,
        opacity: 0.4,
    });

    const blushL = new THREE.Mesh(blushGeo, blushMat);
    blushL.position.set(-0.52, -0.08, 0.6);
    blushL.name = 'blushL';
    headGroup.add(blushL);

    const blushR = new THREE.Mesh(blushGeo, blushMat);
    blushR.position.set(0.52, -0.08, 0.6);
    blushR.name = 'blushR';
    headGroup.add(blushR);

    // ===== ARMS =====
    const armGeo = new THREE.CapsuleGeometry(0.18, 0.6, 8, 16);
    const armMat = new THREE.MeshStandardMaterial({
        color: COLORS.black,
        roughness: 0.5,
    });

    const armGroupL = new THREE.Group();
    armGroupL.position.set(-0.85, 0.1, 0);
    armGroupL.name = 'armGroupL';
    group.add(armGroupL);

    const armL = new THREE.Mesh(armGeo, armMat);
    armL.rotation.z = 0.3;
    armL.castShadow = true;
    armGroupL.add(armL);

    const armGroupR = new THREE.Group();
    armGroupR.position.set(0.85, 0.1, 0);
    armGroupR.name = 'armGroupR';
    group.add(armGroupR);

    const armR = new THREE.Mesh(armGeo, armMat);
    armR.rotation.z = -0.3;
    armR.castShadow = true;
    armGroupR.add(armR);

    // ===== LEGS =====
    const legGeo = new THREE.CapsuleGeometry(0.2, 0.3, 8, 16);
    const legMat = new THREE.MeshStandardMaterial({
        color: COLORS.black,
        roughness: 0.5,
    });

    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.35, -1.3, 0.1);
    legL.rotation.x = -0.2;
    legL.castShadow = true;
    group.add(legL);

    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.35, -1.3, 0.1);
    legR.rotation.x = -0.2;
    legR.castShadow = true;
    group.add(legR);

    // ===== BOW on right ear =====
    const bowGroup = new THREE.Group();
    bowGroup.position.set(0.75, 0.95, 0.1);
    bowGroup.rotation.z = -0.2;
    headGroup.add(bowGroup);

    const bowLobeGeo = new THREE.SphereGeometry(0.1, 12, 12);
    bowLobeGeo.scale(1.4, 0.8, 0.5);
    const bowMat = new THREE.MeshStandardMaterial({
        color: COLORS.bow,
        roughness: 0.4,
        metalness: 0.1,
    });

    const bowL = new THREE.Mesh(bowLobeGeo, bowMat);
    bowL.position.set(-0.1, 0, 0);
    bowL.rotation.z = 0.3;
    bowGroup.add(bowL);

    const bowR = new THREE.Mesh(bowLobeGeo, bowMat);
    bowR.position.set(0.1, 0, 0);
    bowR.rotation.z = -0.3;
    bowGroup.add(bowR);

    const bowCenterGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const bowCenterMat = new THREE.MeshStandardMaterial({
        color: COLORS.bowDark,
        roughness: 0.3,
    });
    const bowCenter = new THREE.Mesh(bowCenterGeo, bowCenterMat);
    bowGroup.add(bowCenter);

    // Position the whole panda
    group.position.set(0, -0.2, 0);
}

// ===== ANIMATION LOOP =====
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    if (!pandaGroup) return;

    const headGroup = pandaGroup.getObjectByName('headGroup');
    const armGroupL = pandaGroup.getObjectByName('armGroupL');
    const armGroupR = pandaGroup.getObjectByName('armGroupR');
    const openMouth = pandaGroup.getObjectByName('openMouth');
    const tongue = pandaGroup.getObjectByName('tongue');
    const blushL = pandaGroup.getObjectByName('blushL');
    const blushR = pandaGroup.getObjectByName('blushR');
    const eyeGroupL = pandaGroup.getObjectByName('eyeGroupL');
    const eyeGroupR = pandaGroup.getObjectByName('eyeGroupR');

    // --- Idle breathing (always active) ---
    breatheAngle += delta * 1.5;
    const breathe = Math.sin(breatheAngle) * 0.03;
    pandaGroup.position.y = -0.2 + breathe;

    // Gentle head sway
    if (headGroup) {
        headGroup.rotation.z = Math.sin(time * 0.8) * 0.03;
    }

    // Blush pulsing
    if (blushL && blushR) {
        const blushAlpha = 0.3 + Math.sin(time * 2) * 0.15;
        blushL.material.opacity = blushAlpha;
        blushR.material.opacity = blushAlpha;
    }

    // Eye sparkle / blink (occasional)
    if (eyeGroupL && eyeGroupR) {
        const blinkCycle = time % 4;
        if (blinkCycle > 3.8 && blinkCycle < 3.95) {
            eyeGroupL.scale.y = 0.1;
            eyeGroupR.scale.y = 0.1;
        } else {
            eyeGroupL.scale.y = 1;
            eyeGroupR.scale.y = 1;
        }
    }

    // --- State-specific animations ---
    switch (currentState) {
        case 'waving':
            if (armGroupR) {
                waveAngle += delta * 8;
                armGroupR.rotation.z = -1.2 + Math.sin(waveAngle) * 0.5;
                armGroupR.rotation.x = -0.3;
            }
            if (headGroup) {
                headGroup.rotation.z = Math.sin(time * 3) * 0.08;
            }
            break;

        case 'working':
            if (armGroupL) {
                armGroupL.rotation.z = 0.8 + Math.sin(time * 10) * 0.15;
                armGroupL.rotation.x = -0.5 + Math.sin(time * 10 + 1) * 0.1;
            }
            if (armGroupR) {
                armGroupR.rotation.z = -0.8 + Math.sin(time * 10 + 2) * 0.15;
                armGroupR.rotation.x = -0.5 + Math.sin(time * 10 + 3) * 0.1;
            }
            if (headGroup) {
                headGroup.rotation.x = Math.sin(time * 4) * 0.05;
            }
            break;

        case 'talking':
            if (openMouth) {
                mouthOpen = 0.5 + Math.sin(time * 12) * 0.5;
                openMouth.scale.y = mouthOpen;
            }
            if (tongue) {
                tongue.scale.y = mouthOpen > 0.3 ? mouthOpen * 0.8 : 0;
            }
            if (headGroup) {
                headGroup.rotation.x = Math.sin(time * 3) * 0.06;
                headGroup.rotation.y = Math.sin(time * 2) * 0.04;
            }
            break;

        case 'celebrating':
            bounceOffset += delta * 6;
            pandaGroup.position.y = -0.2 + Math.abs(Math.sin(bounceOffset)) * 0.3;
            pandaGroup.rotation.y = Math.sin(bounceOffset * 0.5) * 0.15;

            if (armGroupL) {
                armGroupL.rotation.z = 1.5 + Math.sin(bounceOffset * 2) * 0.4;
            }
            if (armGroupR) {
                armGroupR.rotation.z = -1.5 + Math.sin(bounceOffset * 2 + 1) * 0.4;
            }
            if (openMouth) {
                openMouth.scale.y = 0.7 + Math.sin(bounceOffset * 3) * 0.3;
            }
            if (tongue) {
                tongue.scale.y = 0.6;
            }
            break;

        case 'listening':
            if (headGroup) {
                headGroup.rotation.z = Math.sin(time * 1.5) * 0.1;
                headGroup.rotation.x = -0.1;
            }
            // Ears perk up
            const earL = pandaGroup.getObjectByName('earL');
            const earR = pandaGroup.getObjectByName('earR');
            if (earL && earR) {
                earL.scale.y = 1.1 + Math.sin(time * 3) * 0.05;
                earR.scale.y = 1.1 + Math.sin(time * 3 + 1) * 0.05;
            }
            break;

        default: // idle
            if (armGroupL) {
                armGroupL.rotation.z = 0.3 + Math.sin(time * 1.2) * 0.02;
                armGroupL.rotation.x = 0;
            }
            if (armGroupR) {
                armGroupR.rotation.z = -0.3 + Math.sin(time * 1.2 + 1) * 0.02;
                armGroupR.rotation.x = 0;
            }
            if (openMouth) {
                openMouth.scale.y = Math.max(0, openMouth.scale.y - delta * 3);
            }
            if (tongue) {
                tongue.scale.y = Math.max(0, tongue.scale.y - delta * 3);
            }
            pandaGroup.rotation.y *= 0.95; // Smoothly return to center
            break;
    }

    renderer.render(scene, camera);
}

// ===== PUBLIC: Set Panda State =====
function setPanda3DState(state) {
    currentState = state;
    waveAngle = 0;
    bounceOffset = 0;
}

// Expose globally
window.initPanda3D = initPanda3D;
window.setPanda3DState = setPanda3DState;
