/* ================================================
   PandaTravel — 3D Panda via Three.js (self-contained)
   ================================================ */

(function () {
    let scene, camera, renderer, pandaGroup;
    let clock;
    let state = 'idle';
    let t = 0;
    let container;

    const C = {
        white:   0xf4f0ec,
        cream:   0xe2d8cc,
        black:   0x1a1826,
        darkGray:0x2a2740,
        pink:    0xffb3c6,
        blush:   0xff8fa3,
        pupil:   0x0a0814,
        accent:  0x818cf8,
        bow:     0xff4f81,
        bowDark: 0xcc2255,
        tongue:  0xff6b8a,
    };

    function mat(color, roughness = 0.4, metalness = 0.05, extra = {}) {
        return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    }

    // ─── Build Panda ─────────────────────────────────────────────────
    function buildPanda() {
        pandaGroup = new THREE.Group();

        /* Torso */
        const torsoGeo = new THREE.SphereGeometry(1, 32, 32);
        torsoGeo.scale(0.88, 1.0, 0.78);
        const torso = new THREE.Mesh(torsoGeo, mat(C.white));
        torso.position.y = -0.3;
        pandaGroup.add(torso);

        /* Belly patch */
        const bellyGeo = new THREE.SphereGeometry(0.52, 24, 24);
        bellyGeo.scale(1, 1.15, 0.28);
        const belly = new THREE.Mesh(bellyGeo, mat(C.cream, 0.6));
        belly.position.set(0, -0.2, 0.5);
        pandaGroup.add(belly);

        /* ─── Head group ─── */
        const headGroup = new THREE.Group();
        headGroup.position.y = 1.12;
        headGroup.name = 'headGroup';
        pandaGroup.add(headGroup);

        const headGeo = new THREE.SphereGeometry(0.9, 32, 32);
        headGeo.scale(1, 0.93, 0.9);
        headGroup.add(new THREE.Mesh(headGeo, mat(C.white)));

        /* Ears */
        const earGeo = new THREE.SphereGeometry(0.3, 20, 20);
        const earMat = mat(C.black, 0.55);
        const innerEarGeo = new THREE.SphereGeometry(0.14, 16, 16);
        const innerEarMat = mat(C.pink, 0.7);

        [[-0.62, 0.68, -0.12], [0.62, 0.68, -0.12]].forEach(([x, y, z], i) => {
            const ear = new THREE.Mesh(earGeo, earMat);
            ear.position.set(x, y, z);
            headGroup.add(ear);
            const inner = new THREE.Mesh(innerEarGeo, innerEarMat);
            inner.position.set(x, y, z + 0.14);
            headGroup.add(inner);
        });

        /* Eye patches */
        const patchGeo = new THREE.SphereGeometry(0.3, 24, 24);
        patchGeo.scale(1.05, 0.95, 0.5);
        [[-0.3, 0.1, 0.62], [0.3, 0.1, 0.62]].forEach(([x, y, z], i) => {
            const patch = new THREE.Mesh(patchGeo, mat(C.black, 0.5));
            patch.position.set(x, y, z);
            patch.rotation.z = i === 0 ? 0.18 : -0.18;
            headGroup.add(patch);
        });

        /* Eyes (whites + pupils + sparkles) */
        const eyeWhiteGeo = new THREE.SphereGeometry(0.17, 20, 20);
        const eyeWhiteMat = mat(0xffffff, 0.1, 0.05);
        const pupilGeo = new THREE.SphereGeometry(0.10, 20, 20);
        const pupilMat = mat(C.pupil, 0.1);
        const sparkGeo = new THREE.SphereGeometry(0.035, 10, 10);
        const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const spark2Geo = new THREE.SphereGeometry(0.018, 8, 8);

        [[-0.3, 0.12, 0.74], [0.3, 0.12, 0.74]].forEach(([x, y, z]) => {
            const eyeG = new THREE.Group();
            eyeG.position.set(x, y, z);
            eyeG.name = x < 0 ? 'eyeL' : 'eyeR';
            headGroup.add(eyeG);

            eyeG.add(new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat));

            const pupil = new THREE.Mesh(pupilGeo, pupilMat);
            pupil.position.z = 0.09;
            eyeG.add(pupil);

            const sp1 = new THREE.Mesh(sparkGeo, sparkMat);
            sp1.position.set(0.05, 0.05, 0.17);
            eyeG.add(sp1);

            const sp2 = new THREE.Mesh(spark2Geo, sparkMat);
            sp2.position.set(-0.04, -0.02, 0.17);
            eyeG.add(sp2);
        });

        /* Nose */
        const noseGeo = new THREE.SphereGeometry(0.085, 16, 16);
        noseGeo.scale(1.3, 1, 1);
        const nose = new THREE.Mesh(noseGeo, mat(C.black, 0.3));
        nose.position.set(0, -0.08, 0.87);
        headGroup.add(nose);

        /* Mouth group */
        const mouthGroup = new THREE.Group();
        mouthGroup.position.set(0, -0.22, 0.8);
        mouthGroup.name = 'mouthGroup';
        headGroup.add(mouthGroup);

        // Smile curve (torus arc)
        const smileGeo = new THREE.TorusGeometry(0.09, 0.022, 8, 20, Math.PI);
        const smile = new THREE.Mesh(smileGeo, mat(C.black, 0.5));
        smile.rotation.x = Math.PI;
        smile.name = 'smile';
        mouthGroup.add(smile);

        // Open mouth (for talking)
        const openGeo = new THREE.SphereGeometry(0.09, 16, 16);
        openGeo.scale(1.2, 0.7, 0.5);
        const openMouth = new THREE.Mesh(openGeo, mat(0x2a0808, 0.9));
        openMouth.position.set(0, -0.02, 0.02);
        openMouth.scale.y = 0;
        openMouth.name = 'openMouth';
        mouthGroup.add(openMouth);

        // Tongue
        const tongueGeo = new THREE.SphereGeometry(0.05, 12, 12);
        tongueGeo.scale(1.2, 0.55, 0.9);
        const tongue = new THREE.Mesh(tongueGeo, mat(C.tongue, 0.7));
        tongue.position.set(0, -0.05, 0.03);
        tongue.scale.y = 0;
        tongue.name = 'tongue';
        mouthGroup.add(tongue);

        /* Blush */
        const blushGeo = new THREE.SphereGeometry(0.14, 14, 14);
        blushGeo.scale(1.1, 0.55, 0.3);
        [-0.52, 0.52].forEach((x, i) => {
            const blush = new THREE.Mesh(blushGeo, mat(C.blush, 0.9, 0, { transparent: true, opacity: 0.45 }));
            blush.position.set(x, -0.1, 0.62);
            blush.name = i === 0 ? 'blushL' : 'blushR';
            headGroup.add(blush);
        });

        /* Bow (right ear) */
        const bowGroup = new THREE.Group();
        bowGroup.position.set(0.78, 0.98, 0.12);
        bowGroup.rotation.z = -0.2;
        headGroup.add(bowGroup);

        const lobeGeo = new THREE.SphereGeometry(0.1, 12, 12);
        lobeGeo.scale(1.5, 0.75, 0.5);
        const bowMat = mat(C.bow, 0.35, 0.1);
        const bowCenterMat = mat(C.bowDark, 0.3, 0.1);

        const lobeL = new THREE.Mesh(lobeGeo, bowMat);
        lobeL.position.set(-0.1, 0, 0); lobeL.rotation.z = 0.35;
        bowGroup.add(lobeL);
        const lobeR = new THREE.Mesh(lobeGeo, bowMat);
        lobeR.position.set(0.1, 0, 0); lobeR.rotation.z = -0.35;
        bowGroup.add(lobeR);
        bowGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), bowCenterMat));

        /* Arms */
        const armGeo = new THREE.CapsuleGeometry(0.19, 0.62, 8, 16);
        const armMat = mat(C.black, 0.5);

        const armGroupL = new THREE.Group();
        armGroupL.position.set(-0.88, 0.08, 0.05);
        armGroupL.name = 'armGroupL';
        const armL = new THREE.Mesh(armGeo, armMat);
        armL.rotation.z = 0.35;
        armGroupL.add(armL);
        pandaGroup.add(armGroupL);

        const armGroupR = new THREE.Group();
        armGroupR.position.set(0.88, 0.08, 0.05);
        armGroupR.name = 'armGroupR';
        const armR = new THREE.Mesh(armGeo, armMat);
        armR.rotation.z = -0.35;
        armGroupR.add(armR);
        pandaGroup.add(armGroupR);

        /* Legs */
        const legGeo = new THREE.CapsuleGeometry(0.21, 0.28, 8, 16);
        const legMat = mat(C.black, 0.5);
        [[-0.36, -1.28, 0.1], [0.36, -1.28, 0.1]].forEach(([x, y, z]) => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(x, y, z);
            leg.rotation.x = -0.2;
            pandaGroup.add(leg);
        });

        scene.add(pandaGroup);
    }

    /* ─── Animate ─────────────────────────────────────────────── */
    function animate() {
        requestAnimationFrame(animate);
        const dt = clock.getDelta();
        t += dt;

        if (!pandaGroup) { renderer.render(scene, camera); return; }

        const headGroup  = pandaGroup.getObjectByName('headGroup');
        const armGroupL  = pandaGroup.getObjectByName('armGroupL');
        const armGroupR  = pandaGroup.getObjectByName('armGroupR');
        const openMouth  = pandaGroup.getObjectByName('openMouth');
        const tongue     = pandaGroup.getObjectByName('tongue');
        const blushL     = pandaGroup.getObjectByName('blushL');
        const blushR     = pandaGroup.getObjectByName('blushR');
        const eyeL       = pandaGroup.getObjectByName('eyeL');
        const eyeR       = pandaGroup.getObjectByName('eyeR');

        // ── Always: blush pulse ──
        if (blushL && blushR) {
            const op = 0.35 + Math.sin(t * 1.8) * 0.15;
            blushL.material.opacity = blushR.material.opacity = op;
        }

        // ── Always: blink every ~4.5s ──
        if (eyeL && eyeR) {
            const blinkPhase = t % 4.5;
            const blink = blinkPhase > 4.2 && blinkPhase < 4.35 ? 0.05 : 1;
            eyeL.scale.y = eyeR.scale.y = blink;
        }

        // ── Always: subtle idle breathe ──
        pandaGroup.position.y = -0.2 + Math.sin(t * 1.6) * 0.025;

        // ── State animations ──
        switch (state) {
            case 'idle':
                if (headGroup) {
                    headGroup.rotation.z = Math.sin(t * 0.7) * 0.04;
                    headGroup.rotation.x = 0;
                    headGroup.rotation.y = Math.sin(t * 0.4) * 0.05;
                }
                resetArms(armGroupL, armGroupR, dt);
                closemouth(openMouth, tongue, dt);
                break;

            case 'waving':
                if (headGroup) {
                    headGroup.rotation.z = Math.sin(t * 3) * 0.08;
                }
                if (armGroupR) {
                    armGroupR.rotation.z = -1.3 + Math.sin(t * 8) * 0.45;
                    armGroupR.rotation.x = -0.3;
                }
                if (armGroupL) {
                    armGroupL.rotation.z = 0.35;
                    armGroupL.rotation.x = 0;
                }
                closemouth(openMouth, tongue, dt);
                break;

            case 'working':
                if (armGroupL) {
                    armGroupL.rotation.z = 0.9 + Math.sin(t * 12) * 0.18;
                    armGroupL.rotation.x = -0.5 + Math.sin(t * 12 + 1) * 0.1;
                }
                if (armGroupR) {
                    armGroupR.rotation.z = -0.9 + Math.sin(t * 12 + 2) * 0.18;
                    armGroupR.rotation.x = -0.5 + Math.sin(t * 12 + 3) * 0.1;
                }
                if (headGroup) headGroup.rotation.x = Math.sin(t * 3) * 0.05;
                closemouth(openMouth, tongue, dt);
                break;

            case 'talking':
                if (openMouth) {
                    const m = 0.5 + Math.sin(t * 14) * 0.5;
                    openMouth.scale.y = m;
                }
                if (tongue) tongue.scale.y = openMouth ? (openMouth.scale.y > 0.3 ? openMouth.scale.y * 0.8 : 0) : 0;
                if (headGroup) { headGroup.rotation.x = Math.sin(t * 3) * 0.07; headGroup.rotation.y = Math.sin(t * 2) * 0.05; }
                break;

            case 'celebrating':
                pandaGroup.position.y = -0.2 + Math.abs(Math.sin(t * 6)) * 0.35;
                pandaGroup.rotation.y = Math.sin(t * 3) * 0.15;
                if (armGroupL) { armGroupL.rotation.z = 1.6 + Math.sin(t * 4) * 0.35; }
                if (armGroupR) { armGroupR.rotation.z = -1.6 + Math.sin(t * 4 + 1) * 0.35; }
                if (openMouth) openMouth.scale.y = 0.8;
                if (tongue) tongue.scale.y = 0.7;
                break;

            case 'listening':
                if (headGroup) { headGroup.rotation.z = Math.sin(t * 1.5) * 0.12; headGroup.rotation.x = -0.08; }
                resetArms(armGroupL, armGroupR, dt);
                closemouth(openMouth, tongue, dt);
                break;
        }

        renderer.render(scene, camera);
    }

    function resetArms(L, R, dt) {
        if (L) { L.rotation.z += (0.35 - L.rotation.z) * 0.1; L.rotation.x += (0 - L.rotation.x) * 0.1; }
        if (R) { R.rotation.z += (-0.35 - R.rotation.z) * 0.1; R.rotation.x += (0 - R.rotation.x) * 0.1; }
    }
    function closemouth(om, ton, dt) {
        if (om) om.scale.y += (0 - om.scale.y) * 0.15;
        if (ton) ton.scale.y += (0 - ton.scale.y) * 0.15;
    }

    /* ─── Public Init ─────────────────────────────────────────── */
    window.initPanda3D = function (containerId) {
        container = document.getElementById(containerId);
        if (!container) return;

        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded, falling back to CSS panda');
            return;
        }

        const w = container.clientWidth  || container.offsetWidth  || 380;
        const h = container.clientHeight || container.offsetHeight || 280;

        // Scene
        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
        camera.position.set(0, 1.2, 8.5);
        camera.lookAt(0, 0.5, 0);

        // Renderer — transparent background
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        container.style.overflow = 'hidden';
        container.appendChild(renderer.domElement);

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.65));

        const sunLight = new THREE.DirectionalLight(0xfaf0ff, 0.85);
        sunLight.position.set(4, 6, 6);
        sunLight.castShadow = true;
        scene.add(sunLight);

        const rimLight = new THREE.DirectionalLight(0x818cf8, 0.35);
        rimLight.position.set(-4, 2, -4);
        scene.add(rimLight);

        const fillLight = new THREE.DirectionalLight(0xffccee, 0.2);
        fillLight.position.set(0, -4, 3);
        scene.add(fillLight);

        clock = new THREE.Clock();
        buildPanda();
        animate();

        // Resize
        window.addEventListener('resize', () => {
            const nw = container.clientWidth  || 380;
            const nh = container.clientHeight || 280;
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        });
    };

    window.setPanda3DState = function (newState) {
        state = newState;
    };
})();
