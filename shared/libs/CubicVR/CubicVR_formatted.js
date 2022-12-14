/*
  Javascript port of CubicVR 3D engine for WebGL
  by Charles J. Cliffe
  http://www.cubicvr.org/

  May be used under the terms of the MIT license.
  http://www.opensource.org/licenses/mit-license.php
*/

/*globals alert: false */
try {
    if (!window) (self.window = self), (self.document = {}), (self.fakeWindow = !0), (self.console = { log: function () {} });
} catch (e$$5) {
    (self.window = self), (self.document = {}), (self.fakeWindow = !0), (self.console = { log: function () {} });
}
(function (u, x, r, o, q) {
    function m(a, b) {
        C.registry[a] = !0;
        var n = b(C),
            h;
        for (h in n) n.hasOwnProperty(h) && (d[h] = n[h]);
    }
    var e = "";
    try {
        for (var g = x.querySelectorAll("script"), a = 0, b = g.length; a < b; a++) {
            var c = g[a].src.lastIndexOf("/CubicVR.js");
            c > -1 && (e = g[a].src.substr(0, c) + "/");
        }
    } catch (h) {}
    var d = (u.CubicVR = {}),
        n = {
            CoreShader_vs: null,
            CoreShader_fs: null,
            canvas: null,
            width: null,
            height: null,
            fixed_aspect: 0,
            fixed_size: null,
            depth_alpha: !1,
            default_filter: 1,
            mainloop: null,
            shadow_near: 0.1,
            shadow_far: 100,
            soft_shadow: !1,
            resize_active: !1,
            emptyLight: null,
            resizeList: [],
            canvasSizeFactor: 1,
        },
        t;
    try {
        t =
            console !== void 0 && console.log
                ? function (a) {
                      console.log("CubicVR Log: " + a);
                  }
                : function () {};
    } catch (s) {
        t = o;
    }
    var H = { quality: { LOW: 0, MEDIUM: 1, HIGH: 2 } },
        C = { undef: q, nop: o, scriptLocation: e, GLCore: n, Textures: [], Textures_obj: [], Textures_ref: [], Images: [], ShaderPool: [], log: t, registry: {}, enums: H, MAX_LIGHTS: 6, features: {}, quality: H.HIGH },
        L = {
            low: { antiAlias: !1, lightPerPixel: !1, lightShadows: !1, texturePerPixel: !1, postProcess: !1 },
            medium: { antiAlias: !1, lightPerPixel: !0, lightShadows: !1, texturePerPixel: !1, postProcess: !1 },
            high: { antiAlias: !0, lightPerPixel: !0, lightShadows: !0, texturePerPixel: !0, postProcess: !0 },
        };
    C.features = L.high;
    n.init = function (a, b, h) {
        var c,
            s = d.util;
        b && h
            ? ((b = s.getScriptContents(b)), (h = s.getScriptContents(h)))
            : d.CubicVRCoreVS && d.CubicVRCoreFS
            ? ((b = d.CubicVRCoreVS), (h = d.CubicVRCoreFS))
            : ((b = s.getScriptContents(e + "CubicVR_Core.vs")), (h = s.getScriptContents(e + "CubicVR_Core.fs")));
        if (a === q) {
            a = x.createElement("canvas");
            c || (c = a.getContext("experimental-webgl", { antialias: C.features.antiAlias }));
            n.gl = c;
            if (n.fixed_size !== null) (n.width = n.fixed_size[0]), (n.height = n.fixed_size[1]), n.resizeElement(a, n.width, n.height);
            else if ((n.addResizeable(a), n.canvasSizeFactor !== 1 && a.getContext !== q)) {
                var s = r.round(u.innerWidth * n.canvasSizeFactor),
                    g = r.round(u.innerHeight * n.canvasSizeFactor);
                n.resizeElement(a, s, g);
                a.style.top = u.innerHeight / 2 - g / 2 + "px";
                a.style.left = u.innerWidth / 2 - s / 2 + "px";
                a.style.position = "absolute";
            } else n.resizeElement(a, u.innerWidth, u.innerHeight);
            x.body.appendChild(a);
        }
        if (a.getContext !== q && a.width !== q && a.height !== q) {
            try {
                c || (c = a.getContext("experimental-webgl")),
                    c.viewport(0, 0, a.width, a.height),
                    (n.canvas = a),
                    (n.width = a.width),
                    (n.height = a.height),
                    c.clearColor(0, 0, 0, 1),
                    c.clearDepth(1),
                    c.enable(c.DEPTH_TEST),
                    c.depthFunc(c.LEQUAL);
            } catch (m) {}
            if (!c) return null;
        } else c = a;
        n.gl = c;
        n.CoreShader_vs = b;
        n.CoreShader_fs = h;
        c.enable(c.CULL_FACE);
        c.cullFace(c.BACK);
        c.frontFace(c.CCW);
        for (b = H.light.type.NULL; b < H.light.type.MAX; b++) C.ShaderPool[b] = [];
        h = new d.Texture();
        a = new d.Material();
        for (b = 0; b < H.texture.map.MAX; b++) b !== H.texture.map.BUMP && a.setTexture(h, b);
        a.opacity = 0.5;
        b = 1;
        try {
            for (;;) {
                a.use(H.light.type.POINT, b);
                if (b === 8) {
                    C.MAX_LIGHTS = b;
                    break;
                }
                b++;
            }
        } catch (v) {
            C.MAX_LIGHTS = b;
        }
        a = n.emptyLight = new d.Light(H.light.type.POINT);
        a.diffuse = [0, 0, 0];
        a.specular = [0, 0, 0];
        a.distance = 0;
        a.intensity = 0;
        a.cutoff = 0;
        t("Calibrated maximum lights per pass to: " + b);
        for (b = H.light.type.NULL; b < H.light.type.MAX; b++) C.ShaderPool[b] = [];
        if (n.resizeList.length)
            u.addEventListener(
                "resize",
                function () {
                    d.GLCore.onResize();
                },
                !1
            ),
                (n.resize_active = !0);
        return c;
    };
    n.addResizeable = function (a) {
        d.GLCore.resizeList.push(a);
    };
    n.onResize = function () {
        var a = u.innerWidth,
            b = u.innerHeight;
        n.fixed_size !== null && ((a = d.GLCore.fixed_size[0]), (b = d.GLCore.fixed_size[1]));
        for (var h = 0, c = d.GLCore.resizeList.length; h < c; h++) n.resizeElement(d.GLCore.resizeList[h], a, b);
    };
    n.setFixedAspect = function (a) {
        d.GLCore.fixed_aspect = a;
    };
    n.setFixedSize = function (a, b) {
        d.GLCore.fixed_size = [a, b];
    };
    n.getCanvas = function () {
        return d.GLCore.canvas;
    };
    n.resizeElement = function (a, b, h) {
        var c = n.gl;
        if (n.fixed_aspect !== 0) {
            var t = b * (1 / d.GLCore.fixed_aspect);
            t > h && ((t = h), (b = h * d.GLCore.fixed_aspect));
            h = t;
        }
        if (a.getContext !== q) {
            a.width = b;
            a.height = h;
            if (!d.GLCore.fixed_size) (a.style.left = ((u.innerWidth / 2 - b / 2) | 0) + "px"), (a.style.top = ((u.innerHeight / 2 - h / 2) | 0) + "px"), (a.style.position = "absolute");
            c.viewport(0, 0, b, h);
        } else a.resize(b, h);
    };
    n.setDepthAlpha = function (a, d, b) {
        n.depth_alpha = a;
        n.depth_alpha_near = d;
        n.depth_alpha_far = b;
    };
    n.setDefaultFilter = function (a) {
        n.default_filter = a;
    };
    n.setSoftShadows = function (a) {
        n.soft_shadow = a;
    };
    n.setCanvasSizeFactor = function (a) {
        n.canvasSizeFactor = a;
    };
    n.setQuality = function (a) {
        if (a === H.quality.HIGH) C.features = L.high;
        else if (a === H.quality.MEDIUM) C.features = L.medium;
        else if (a === H.quality.LOW) C.features = L.low;
        C.quality = a;
        return C.features;
    };
    n.getQuality = function () {
        return C.features;
    };
    var v = {
        GLCore: n,
        init: n.init,
        addResizeable: n.addResizeable,
        setFixedAspect: n.setFixedAspect,
        setFixedSize: n.setFixedSize,
        setCanvasSizeFactor: n.setCanvasSizeFactor,
        getCanvas: n.getCanvas,
        enums: H,
        IdentityMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        Textures: C.Textures,
        Textures_obj: C.Textures_obj,
        Images: C.Images,
        globalAmbient: [0.1, 0.1, 0.1],
        setGlobalAmbient: function (a) {
            d.globalAmbient = a;
        },
        setGlobalDepthAlpha: n.setDepthAlpha,
        setDefaultFilter: n.setDefaultFilter,
        setSoftShadows: n.setSoftShadows,
        setQuality: n.setQuality,
        getQuality: n.getQuality,
        RegisterModule: m,
        getScriptLocation: function () {
            return e;
        },
    };
    m("Core", function () {
        return v;
    });
})(window, window.document, Math, function () {});
(function () {
    function u() {
        for (var e = 0; e < r.length; e++) importScripts(CubicVR.getScriptLocation() + "/source/CubicVR." + r[e] + ".js");
    }
    var x,
        r = [
            "Math",
            "Utility",
            "Shader",
            "MainLoop",
            "Texture",
            "Material",
            "Mesh",
            "UVMapper",
            "Renderer",
            "Light",
            "Camera",
            "Motion",
            "Scene",
            "PostProcess",
            "Layout",
            "Primitives",
            "COLLADA",
            "GML",
            "Particles",
            "Landscape",
            "Octree",
            "CVRXML",
            "Worker",
            "Polygon",
            "ScenePhysics",
            "CollisionMap",
        ];
    try {
        if (typeof define === "function" && define.amd) {
            var o = [];
            for (x = 0; x < r.length; x++) o.push("order!./source/CubicVR." + r[x]);
            define(o, function () {});
        } else for (x = 0; x < r.length; x++) document.write('<script type="text/javascript" src="' + CubicVR.getScriptLocation() + "/source/CubicVR." + r[x] + '.js"></script>');
    } catch (q) {
        var m = function (e) {
            var g = e.data.data + "";
            CubicVR.getScriptLocation = function () {
                return g;
            };
            u();
            self.removeEventListener("message", m, !1);
            CubicVR.InitWorker();
        };
        self.addEventListener("message", m, !1);
    }
})();
CubicVR.RegisterModule("COLLADA", function (u) {
    function x(g, a) {
        function b(a) {
            if (!a.color) return !1;
            return (a = a.color) ? h.floatDelimArray(a.$, " ") : !1;
        }
        function c(a) {
            var L;
            if (!a["float"]) return !1;
            return (L = (a = a["float"]) ? parseFloat(a.$) : 0), (a = L);
        }
        var h = CubicVR.util;
        new CubicVR.Mesh();
        new CubicVR.Scene();
        var d, n, t, s;
        cl = typeof g == "object" ? g : g.indexOf(".js") != -1 ? h.getJSON(g) : CubicVR.util.xml2badgerfish(h.getXML(g));
        var H,
            C,
            q,
            v,
            D,
            z,
            A,
            w,
            y,
            u,
            B,
            E = cl;
        cl = null;
        if (!E.COLLADA) throw Error(g + " does not appear to be a valid COLLADA file.");
        var E = E.COLLADA,
            x = { up_axis: 1, images: [], effects: [], materials: [], meshes: [], scenes: [], lights: [], cameras: [], animations: [] };
        if (E.asset) {
            var J = E.asset.up_axis.$;
            if (J === "X_UP") x.up_axis = 0;
            else if (J === "Y_UP") x.up_axis = 1;
            else if (J === "Z_UP") x.up_axis = 2;
        }
        J = x.up_axis;
        if (E.library_images) {
            if (E.library_images.image && !E.library_images.image.length) E.library_images.image = [E.library_images.image];
            if (E.library_images.image.length) {
                n = E.library_images.image;
                d = 0;
                for (w = n.length; d < w; d++) {
                    var I = n[d],
                        F = I["@id"];
                    v = I["@name"];
                    I = I.init_from;
                    if (I.$)
                        (I = I.$),
                            a !== r && I.lastIndexOf("/") !== -1 && (I = I.substr(I.lastIndexOf("/") + 1)),
                            a !== r && I.lastIndexOf("\\") !== -1 && (I = I.substr(I.lastIndexOf("\\") + 1)),
                            (x.images[F] = { source: I, id: F, name: v });
                }
            }
        }
        var G, O, K, T, X;
        if (E.library_effects) {
            var M = E.library_effects.effect;
            M && !M.length && (M = [M]);
            I = 0;
            for (G = M.length; I < G; I++) {
                w = M[I];
                v = w["@id"];
                s = {};
                s.id = v;
                s.surfaces = [];
                s.samplers = [];
                (F = w.profile_COMMON.newparam) && !F.length && (F = [F]);
                if (F) {
                    n = 0;
                    for (d = F.length; n < d; n++) {
                        var Q = F[n],
                            N = Q["@sid"];
                        if (Q.surface) {
                            if (((s.surfaces[N] = {}), (Q = Q.surface.init_from.$), typeof x.images[Q] === "object")) s.surfaces[N].source = a + "/" + x.images[Q].source;
                        } else if (Q.sampler2D) {
                            s.samplers[N] = {};
                            s.samplers[N].source = Q.sampler2D.source.$;
                            if (Q.sampler2D.minfilter) s.samplers[N].minfilter = Q.sampler2D.minfilter.$;
                            if (Q.sampler2D.magfilter) s.samplers[N].magfiter = Q.sampler2D.magfilter.$;
                        }
                    }
                }
                (n = w.profile_COMMON.technique) && !n.length && (n = [n]);
                s.material = { textures_ref: [] };
                w = 0;
                for (F = n.length; w < F; w++) {
                    d = n[w].blinn;
                    if (!d) d = n[w].phong;
                    if (!d) d = n[w].lambert;
                    if (d)
                        for (A in d) {
                            var U = d[A],
                                N = b(U),
                                Q = c(U);
                            U = U.texture ? U.texture["@texture"] : !1;
                            N !== !1 && N.length > 3 && N.pop();
                            if (A == "emission") {
                                if (N !== !1) s.material.ambient = N;
                            } else if (A != "ambient")
                                if (A == "diffuse") {
                                    if (N !== !1) s.material.color = N;
                                } else if (A == "specular") {
                                    if (N !== !1) s.material.specular = N;
                                } else if (A == "shininess" && Q !== !1) s.material.shininess = Q;
                            if (U !== !1)
                                (N = s.surfaces[s.samplers[U].source].source),
                                    A == "emission"
                                        ? s.material.textures_ref.push({ image: N, type: o.texture.map.AMBIENT })
                                        : A == "ambient"
                                        ? s.material.textures_ref.push({ image: N, type: o.texture.map.AMBIENT })
                                        : A == "diffuse"
                                        ? s.material.textures_ref.push({ image: N, type: o.texture.map.COLOR })
                                        : A == "specular"
                                        ? s.material.textures_ref.push({ image: N, type: o.texture.map.SPECULAR })
                                        : A != "shininess" &&
                                          (A == "reflective"
                                              ? s.material.textures_ref.push({ image: N, type: o.texture.map.REFLECT })
                                              : A != "reflectivity" && A == "transparent" && s.material.textures_ref.push({ image: N, type: o.texture.map.ALPHA }));
                        }
                    x.effects[v] = s;
                }
            }
        }
        w = e.getAllOf(E, "instance_geometry");
        A = [];
        if (w.length) {
            d = 0;
            for (n = w.length; d < n; d++)
                if (((F = w[d]), (v = e.getAllOf(F, "instance_material")), v.length)) {
                    B = 0;
                    for (z = v.length; B < z; B++) (G = v[B]), (I = G["@symbol"]), (G = G["@target"].substr(1)), (A[F["@url"].substr(1) + ":" + I] = G);
                }
        }
        n = E.library_materials;
        if (n.material) {
            (w = n.material) && !w.length && (w = [w]);
            n = 0;
            for (d = w.length; n < d; n++) if (((v = w[n]), (F = v["@id"]), (I = v["@name"]), (v = v.instance_effect))) (v = v["@url"].substr(1)), x.materials.push({ id: F, name: I, mat: x.effects[v].material });
        }
        n = E.library_geometries;
        var Z;
        if (n && ((v = n.geometry) && !v.length && (v = [v]), v.length)) {
            I = 0;
            for (G = v.length; I < G; I++) {
                var M = { id: r, points: [], parts: [] },
                    $ = v[I].mesh;
                if ($) {
                    Z = v[I]["@id"];
                    s = v[I]["@name"];
                    (d = $.source) && !d.length && (d = [d]);
                    s = [];
                    w = 0;
                    for (F = d.length; w < F; w++)
                        if (((N = d[w]), (n = N["@id"]), (Q = N["@name"]), (U = N.float_array) && (s[n] = { id: n, name: Q, data: h.floatDelimArray(U.$ ? U.$ : "", " ") }), (N = N.technique_common.accessor)))
                            if (((s[n].count = N["@count"] | 0), (s[n].stride = N["@stride"] | 0), s[n].count)) s[n].data = h.repackArray(s[n].data, s[n].stride, s[n].count);
                    n = $.vertices;
                    var S = (U = Q = N = null),
                        aa = null;
                    if (n && ((Q = n["@id"]), (d = n.input) && !d.length && (d = [d]), d)) {
                        q = 0;
                        for (O = d.length; q < O; q++) (K = d[q]), K["@semantic"] === "POSITION" && (N = K["@source"].substr(1));
                    }
                    var V = $.triangles;
                    V && !V.length && (V = [V]);
                    if (V) {
                        w = 0;
                        for (F = V.length; w < F; w++) {
                            X = { material: 0, faces: [], normals: [], texcoords: [], colors: [] };
                            n = parseInt(V[w]["@count"], 10);
                            (d = V[w].input) && !d.length && (d = [d]);
                            T = [];
                            if (d.length) {
                                q = 0;
                                for (O = d.length; q < O; q++)
                                    (K = d[q]),
                                        (D = parseInt(K["@offset"], 10)),
                                        (t = K["@source"].substr(1)),
                                        K["@semantic"] === "VERTEX"
                                            ? (t === Q && (t = N), (T[D] = 0))
                                            : K["@semantic"] === "NORMAL"
                                            ? ((U = t), s[U].count && (T[D] = 1))
                                            : K["@semantic"] === "TEXCOORD"
                                            ? ((aa = t), s[aa].count && (T[D] = 2))
                                            : K["@semantic"] === "COLOR"
                                            ? ((S = t), s[S].count && (T[D] = 3))
                                            : (T[D] = 4);
                            }
                            q = T.length;
                            d = Z + ":" + V[w]["@material"];
                            d === null ? (X.material = 0) : A[d] === r ? (m("missing material [" + d + "]@" + Z + "?"), (X.material = 0)) : (X.material = A[d]);
                            d = V[w].p;
                            q = [];
                            d && (q = h.intDelimArray(d.$, " "));
                            if (q.length && ((d = q.length / T.length / 3), d === n)) {
                                if (M.points.length === 0) M.points = s[N].data;
                                d = D = 0;
                                n = q.length;
                                for (D = T.length; d < n; d += D * 3) {
                                    H = [];
                                    C = [];
                                    t = [];
                                    K = [];
                                    for (B = 0; B < D * 3; B++) (O = B % D), T[O] === 0 ? C.push(q[d + B]) : T[O] === 1 ? H.push(q[d + B]) : T[O] === 2 ? t.push(q[d + B]) : T[O] === 3 && K.push(q[d + B]);
                                    C.length &&
                                        (X.faces.push(C),
                                        H.length === 3 && X.normals.push([e.fixuaxis(x.up_axis, s[U].data[H[0]]), e.fixuaxis(x.up_axis, s[U].data[H[1]]), e.fixuaxis(x.up_axis, s[U].data[H[2]])]),
                                        t.length === 3 && X.texcoords.push([s[aa].data[t[0]], s[aa].data[t[1]], s[aa].data[t[2]]]),
                                        K.length === 3 && X.colors.push([s[S].data[K[0]], s[S].data[K[1]], s[S].data[K[2]]]));
                                }
                            }
                            M.parts.push(X);
                        }
                    }
                    V = $.polylist;
                    if (!V) V = $.polygons;
                    V && !V.length && (V = [V]);
                    if (V) {
                        w = 0;
                        for (F = V.length; w < F; w++) {
                            X = { material: 0, faces: [], normals: [], texcoords: [], colors: [] };
                            B = parseInt(V[w]["@count"], 10);
                            (d = V[w].input) && !d.length && (d = [d]);
                            T = [];
                            if (d.length) {
                                q = 0;
                                for (O = d.length; q < O; q++)
                                    (K = d[q]),
                                        (n = K["@offset"]),
                                        n === null && (n = K["@idx"]),
                                        (D = parseInt(n, 10)),
                                        (t = K["@source"].substr(1)),
                                        K["@semantic"] === "VERTEX"
                                            ? (t === Q && (t = N), (T[D] = 0))
                                            : K["@semantic"] === "NORMAL"
                                            ? ((U = t), (T[D] = 1))
                                            : K["@semantic"] === "TEXCOORD"
                                            ? ((aa = t), (T[D] = 2))
                                            : K["@semantic"] === "COLOR"
                                            ? ((S = t), (T[D] = 3))
                                            : (T[D] = 4);
                            }
                            n = V[w].vcount;
                            $ = [];
                            n && ($ = h.intDelimArray(n.$, " "));
                            d = Z + ":" + V[w]["@material"];
                            X.material = d === r ? 0 : A[d];
                            K = V[w].p;
                            q = T.length;
                            O = [];
                            if (K.length > 1 && !$.length) {
                                n = 0;
                                for (d = K.length; n < d; n++) (D = h.intDelimArray(K[n].$, " ")), ($[n] = parseInt(D.length / q, 10)), O.splice(O.length, 0, D);
                            } else K && (O = h.intDelimArray(K.$, " "));
                            if (O.length)
                                if (((d = $.length), d !== B)) m("poly vcount data doesn't add up, skipping object load: " + d + " !== " + B);
                                else {
                                    if (M.points.length === 0) M.points = s[N].data;
                                    d = D = 0;
                                    for (n = $.length; d < n; d++) {
                                        H = [];
                                        C = [];
                                        t = [];
                                        K = [];
                                        B = 0;
                                        for (z = $[d] * q; B < z; B++) T[B % q] === 0 ? C.push(O[D]) : T[B % q] === 1 ? H.push(O[D]) : T[B % q] === 2 ? t.push(O[D]) : T[B % q] === 3 && K.push(O[D]), D++;
                                        if (C.length) {
                                            X.faces.push(C);
                                            if (H.length) {
                                                B = [];
                                                z = 0;
                                                for (C = H.length; z < C; z++) B.push(e.fixuaxis(x.up_axis, s[U].data[H[z]]));
                                                X.normals.push(B);
                                            }
                                            if (t.length) {
                                                B = [];
                                                z = 0;
                                                for (C = t.length; z < C; z++) B.push(s[aa].data[t[z]]);
                                                X.texcoords.push(B);
                                            }
                                            if (K.length) {
                                                B = [];
                                                z = 0;
                                                for (C = K.length; z < C; z++) B.push(s[S].data[K[z]]);
                                                X.colors.push(B);
                                            }
                                        }
                                    }
                                }
                            M.parts.push(X);
                        }
                    }
                    if (J !== 1) {
                        d = 0;
                        for (n = M.points.length; d < n; d++) M.points[d] = e.fixuaxis(x.up_axis, M.points[d]);
                    }
                    M.id = Z;
                    x.meshes.push(M);
                }
            }
        }
        if ((n = E.library_cameras)) {
            (v = n.camera) && !v.length && (v = [v]);
            A = 0;
            for (w = v.length; A < w; A++) {
                n = v[A];
                I = n["@id"];
                G = F = d = 0;
                if (n.optics && n.optics.technique_common && n.optics.technique_common.perspective)
                    (d = n.optics.technique_common.perspective.yfov), (F = n.optics.technique_common.perspective.znear), (G = n.optics.technique_common.perspective.zfar);
                var W;
                if (!d && !F && !G) {
                    (F = n.param) && !F.length && (F = [F]);
                    d = 0;
                    for (n = F.length; d < n; d++) (G = F[d].$), (M = F[d]["@name"]), M == "YFOV" ? (W = parseFloat(G)) : M == "ZNEAR" ? (y = parseFloat(G)) : M == "ZFAR" && (u = parseFloat(G));
                } else (W = d ? parseFloat(d.$) : 60), (y = F ? parseFloat(F.$) : 0.1), (u = G ? parseFloat(G.$) : 1e3);
                x.cameras.push({ id: I, targeted: !1, fov: parseFloat(W), nearclip: parseFloat(y), farclip: parseFloat(u) });
            }
        }
        if ((W = E.library_lights))
            if (((W = W.light) && !W.length && (W = [W]), W)) {
                y = 0;
                for (u = W.length; y < u; y++)
                    if (((cl_light = W[y]), (d = (n = cl_light.technique_common.point) ? n : null), (n = cl_light["@id"]), d !== null))
                        (A = (A = d.intensity) ? parseFloat(A.$) : 1),
                            (w = (w = d.distance) ? parseFloat(w.$) : 10),
                            (d = d.color),
                            (K = [1, 1, 1]),
                            d && (K = h.floatDelimArray(d.$, " ")),
                            x.lights.push({ id: n, name: n, type: o.light.type.POINT, method: o.light.method.STATIC, diffuse: K, specular: [0, 0, 0], distance: w, intensity: A });
            }
        if ((y = E.library_visual_scenes)) {
            W = null;
            (W = y.visual_scene) && !W.length && (W = [W]);
            y = 0;
            for (u = W.length; y < u; y++) {
                v = W[y];
                A = { id: v["@id"], sceneObjects: [], cameras: [], lights: [], parentMap: [] };
                w = [];
                var F = [],
                    Y;
                if ((n = E.library_nodes)) {
                    (G = n.node) && !G.length && (G = [G]);
                    w = [];
                    d = 0;
                    for (n = G.length; d < n; d++) (I = G[d]), (mnodeId = I["@id"]), (w[Y] = I);
                    for (I = [v]; I.length; ) {
                        G = I.pop();
                        if (G.node && ((B = G.node) && !B.length && (B = [B]), B)) {
                            d = 0;
                            for (n = B.length; d < n; d++) I.push(B[d]);
                        }
                        if (G.instance_node) {
                            (M = G.instance_node) && !M.length && (M = [M]);
                            d = 0;
                            for (n = M.length; d < n; d++)
                                if (((s = M[d]["@url"].substr(1)), w[s])) {
                                    if (G.node && G.node.length) G.node = [G.node];
                                    G.node ? G.node.push(w[s]) : (G.node = [w[s]]);
                                }
                        }
                    }
                }
                for (I = [v]; I.length; )
                    if (((G = I.pop()), G.node && ((B = G.node) && !B.length && (B = [B]), B))) {
                        d = 0;
                        for (n = B.length; d < n; d++) (B[d].parentNode = G), F.push(B[d]), I.push(B[d]);
                    }
                if (F.length) {
                    v = 0;
                    for (I = F.length; v < I; v++) {
                        N = F[v];
                        Q = N.instance_geometry;
                        cl_light = F[v].instance_light;
                        n = F[v].instance_camera;
                        Y = N["@id"];
                        G = N["@name"];
                        M = e.cl_getInitalTransform(x.up_axis, N);
                        if (J === 2) M.rotation = e.quaternionFilterZYYZ(M.rotation, n ? [-90, 0, 0] : r);
                        S = U = null;
                        if (Q) {
                            Q && !Q.length && (Q = [Q]);
                            d = 0;
                            for (n = Q.length; d < n; d++) {
                                cl_geom = Q[d];
                                s = cl_geom["@url"].substr(1);
                                S = {};
                                S.name = (G ? G : Y) + (d ? d : "");
                                S.id = (Y ? Y : G) + (d ? d : "");
                                S.meshId = Z;
                                S.meshName = s;
                                if (!U) (S.position = M.position), (S.rotation = M.rotation), (S.scale = M.scale), (S.matrix = M.matrix);
                                A.sceneObjects.push(S);
                                w[S.id] = !0;
                                N.parentNode &&
                                    ((parentNodeId = N.parentNode["@id"]) && w[parentNodeId]
                                        ? A.parentMap.push({ parent: parentNodeId, child: S.id })
                                        : Q.length > 1 && (U ? w[U.id] && A.parentMap.push({ parent: U.id, child: S.id }) : ((U = S), (S = {}))));
                            }
                        } else
                            n
                                ? ((n = n["@url"].substr(1)), A.cameras.push({ name: G ? G : Y, id: G ? G : Y, source: n, position: M.position, rotation: M.rotation }))
                                : cl_light
                                ? ((n = cl_light["@url"].substr(1)), A.lights.push({ name: G ? G : Y, id: G ? G : Y, source: n, position: M.position }))
                                : ((S = { position: M.position, rotation: M.rotation, scale: M.scale, matrix: M.matrix }),
                                  (S.name = G ? G : Y),
                                  (S.id = Y ? Y : G),
                                  A.sceneObjects.push(S),
                                  (w[S.id] = !0),
                                  N.parentNode && (parentNodeId = N.parentNode["@id"]) && w[parentNodeId] && A.parentMap.push({ parent: parentNodeId, child: S.id }));
                    }
                }
                x.scenes.push(A);
            }
        }
        if ((Z = E.library_animations))
            if (((Y = Z.animation) && !Y.length && (Y = [Y]), Y)) {
                J = 0;
                for (W = Y.length; J < W; J++) {
                    A = Y[J];
                    Z = A["@id"];
                    x.animations[Z] = {};
                    x.animations[Z].sources = [];
                    (w = A.source) && !w.length && (w = [w]);
                    if (w.length) {
                        y = 0;
                        for (u = w.length; y < u; y++) {
                            d = w[y];
                            n = d["@id"];
                            M = d.technique_common;
                            v = F = null;
                            d.name_array ? (F = h.textDelimArray(d.name_array.$, " ")) : d.Name_array ? (F = h.textDelimArray(d.Name_array.$, " ")) : d.float_array && (v = h.floatDelimArray(d.float_array.$, " "));
                            d = 0;
                            G = "";
                            I = 1;
                            if (M) (d = M), (M = d.accessor), (d = parseInt(M["@count"], 10)), (G = M["@source"].substr(1)), (M = M["@stride"]) && (I = parseInt(M, 10));
                            x.animations[Z].sources[n] = { data: F ? F : v, count: d, source: G, stride: I };
                            if (I !== 1) x.animations[Z].sources[n].data = h.repackArray(x.animations[Z].sources[n].data, I, d);
                        }
                    }
                    (w = A.sampler) && !w.length && (w = [w]);
                    if (w) {
                        x.animations[Z].samplers = [];
                        y = 0;
                        for (u = w.length; y < u; y++)
                            if (((n = w[y]), (F = n["@id"]), (d = n.input) && !d.length && (d = [d]), d)) {
                                I = [];
                                v = 0;
                                for (n = d.length; v < n; v++) (K = d[v]), (I[K["@semantic"]] = K["@source"].substr(1));
                                x.animations[Z].samplers[F] = I;
                            }
                    }
                    (y = A.channel) && !y.length && (y = [y]);
                    if (y) {
                        x.animations[Z].channels = [];
                        A = 0;
                        for (w = y.length; A < w; A++)
                            (n = y[A]),
                                (u = n["@source"].substr(1)),
                                (n = n["@target"]),
                                (F = n.split("/")),
                                (d = F[0]),
                                (F = F[1].split(".")),
                                x.animations[Z].channels.push({ source: u, target: n, targetName: d, paramName: F[0], typeName: F[1] });
                    }
                }
            }
        if ((E = E.scene)) if ((v = E.instance_visual_scene)) (E = v["@url"].substr(1)), (x.scene = E);
        return x;
    }
    var r = u.undef,
        o = CubicVR.enums,
        q = u.GLCore,
        m = u.log,
        e = {
            fixuaxis: function (e, a) {
                if (e === 0) return [a[1], a[0], a[2]];
                else if (e === 1) return a;
                else if (e === 2) return [a[0], a[2], -a[1]];
            },
            fixscaleaxis: function (e, a) {
                if (e === 0) return [a[1], a[0], a[2]];
                else if (e === 1) return a;
                else if (e === 2) return [a[0], a[2], a[1]];
            },
            fixukaxis: function (e, a, b, c) {
                if (a === o.motion.POS && b === o.motion.Z && e === o.motion.Z) return -c;
                return c;
            },
            getAllOf: function (e, a) {
                for (var b = [e], c = [], h, d, n, t; b.length; )
                    for (d in ((h = b.pop()), h))
                        if (h.hasOwnProperty(d)) {
                            if (d === a)
                                if (h[d].length) {
                                    n = 0;
                                    for (t = h[d].length; n < t; n++) c.push(h[d][n]);
                                } else c.push(h[d]);
                            if (typeof h[d] == "object")
                                if (h[d].length) {
                                    n = 0;
                                    for (t = h[d].length; n < t; n++) b.push(h[d][n]);
                                } else b.push(h[d]);
                        }
                return c;
            },
            quaternionFilterZYYZ: function (e, a) {
                var b = CubicVR.vec3,
                    c = e,
                    h = new CubicVR.Quaternion();
                a !== r && (c = b.add(e, a));
                h.fromEuler(c[0], c[2], -c[1]);
                return h.toEuler();
            },
            cl_getInitalTransform: function (g, a) {
                var b = CubicVR.util,
                    c = { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                    h = a.translate,
                    d = a.rotate,
                    n = a.scale;
                if (a.matrix && !h && !d && !n) return c;
                if (h) c.position = e.fixuaxis(g, b.floatDelimArray(h.$, " "));
                if (d)
                    for (var h = 0, t = d.length; h < t; h++) {
                        var s = d[h],
                            H = s["@sid"],
                            s = b.floatDelimArray(s.$, " ");
                        if (H == "rotateX" || H == "rotationX") c.rotation[0] = s[3];
                        else if (H == "rotateY" || H == "rotationY") c.rotation[1] = s[3];
                        else if (H == "rotateZ" || H == "rotationZ") c.rotation[2] = s[3];
                    }
                if (n) c.scale = e.fixscaleaxis(g, b.floatDelimArray(n.$, " "));
                return c;
            },
        };
    return {
        loadCollada: function (g, a, b) {
            var a = x(g, a, b),
                c = a.up_axis,
                h = [],
                d,
                n,
                t,
                s,
                H,
                m,
                L,
                v;
            n = 0;
            for (t = a.materials.length; n < t; n++) {
                H = a.materials[n];
                L = new CubicVR.Material(H.mat);
                m = 0;
                for (s = H.mat.textures_ref.length; m < s; m++) {
                    v = H.mat.textures_ref[m];
                    var D = null,
                        D = u.Textures_ref[v.image] === void 0 ? new CubicVR.Texture(v.image, q.default_filter, b, g) : u.Textures_obj[u.Textures_ref[v.image]];
                    L.setTexture(D, v.type);
                }
                h[H.id] = L;
            }
            m = [];
            n = 0;
            for (t = a.meshes.length; n < t; n++) {
                var D = a.meshes[n],
                    z = new CubicVR.Mesh(D.id);
                z.points = D.points;
                var A = !1;
                L = 0;
                for (v = D.parts.length; L < v; L++) {
                    var w = D.parts[L];
                    w.material !== 0 && z.setFaceMaterial(h[w.material]);
                    var y = w.normals.length ? !0 : !1,
                        R = w.texcoords.length ? !0 : !1,
                        B = w.colors.length ? !0 : !1;
                    if (B) h[w.material].color_map = !0;
                    s = 0;
                    for (H = w.faces.length; s < H; s++) {
                        var E = z.addFace(w.faces[s]);
                        if (y) z.faces[E].point_normals = w.normals[s];
                        if (R) z.faces[E].uvs = w.texcoords[s];
                        if (B) z.faces[E].point_colors = w.colors[s];
                    }
                    A |= y;
                }
                z.faces.length && (b ? b.addMesh(g, g + ":" + meshId, z) : (A || z.calcNormals(), z.triangulateQuads(), z.compile()), (m[D.id] = z));
            }
            t = [];
            g = 0;
            for (s = a.cameras.length; g < s; g++) t[a.cameras[g].id] = a.cameras[g];
            D = [];
            s = 0;
            for (H = a.lights.length; s < H; s++) D[a.lights[s].id] = a.lights[s];
            b = {};
            h = {};
            n = {};
            g = {};
            L = 0;
            for (v = a.scenes.length; L < v; L++) {
                z = a.scenes[L];
                A = new CubicVR.Scene();
                s = 0;
                for (H = z.sceneObjects.length; s < H; s++)
                    (w = z.sceneObjects[s]), (y = new CubicVR.SceneObject(w)), (y.obj = (m[w.meshName] ? m[w.meshName] : m[w.meshId]) || null), w.matrix && y.setMatrix(w.matrix), (b[w.id] = y), A.bindSceneObject(y);
                s = 0;
                for (H = z.lights.length; s < H; s++) (w = z.lights[s]), (y = new CubicVR.Light(D[w.source])), (y.position = w.position), (h[w.id] = y), A.bindLight(y);
                if (z.cameras.length) (s = z.cameras[0]), (H = new CubicVR.Camera(t[s.source])), (H.position = s.position), (H.rotation = s.rotation), (n[s.id] = H), (A.camera = H);
                s = 0;
                for (H = z.parentMap.length; s < H; s++) (w = z.parentMap[s]), b[w.parent].bindChild(b[w.child]);
                g[z.id] = A;
            }
            for (var P in a.animations)
                if (a.animations.hasOwnProperty(P) && ((m = a.animations[P]), m.channels.length)) {
                    cCount = 0;
                    for (s = m.channels.length; cCount < s; cCount++) {
                        t = m.channels[cCount];
                        w = m.samplers[t.source];
                        H = m.sources[w.INPUT];
                        L = m.sources[w.OUTPUT];
                        v = m.sources[w.INTERPOLATION];
                        var D = m.sources[w.IN_TANGENT],
                            z = m.sources[w.OUT_TANGENT],
                            A = w.IN_TANGENT !== r,
                            w = w.OUT_TANGENT !== r,
                            y = null,
                            B = b[t.targetName],
                            R = n[t.targetName],
                            J = h[t.targetName];
                        if (B) {
                            if (B.motion === null) B.motion = new CubicVR.Motion();
                            y = B.motion;
                        } else if (R) {
                            if (R.motion === null) R.motion = new CubicVR.Motion();
                            y = R.motion;
                        } else if (J) {
                            if (J.motion === null) J.motion = new CubicVR.Motion();
                            y = J.motion;
                        }
                        if (y !== null) {
                            B = o.motion.POS;
                            E = o.motion.X;
                            if (c === 2) y.yzflip = !0;
                            d = t.paramName;
                            if (d === "rotateX" || d === "rotationX") (B = o.motion.ROT), (E = o.motion.X);
                            else if (d === "rotateY" || d === "rotationY") (B = o.motion.ROT), (E = o.motion.Y);
                            else if (d === "rotateZ" || d === "rotationZ") (B = o.motion.ROT), (E = o.motion.Z);
                            else if (d === "location") {
                                B = o.motion.POS;
                                if (t.typeName === "X") E = o.motion.X;
                                if (t.typeName === "Y") E = o.motion.Y;
                                if (t.typeName === "Z") E = o.motion.Z;
                            } else if (d === "translate") {
                                B = o.motion.POS;
                                if (t.typeName === "X") E = o.motion.X;
                                if (t.typeName === "Y") E = o.motion.Y;
                                if (t.typeName === "Z") E = o.motion.Z;
                            } else if (d === "LENS") continue;
                            else if (d === "FOV") (B = o.motion.FOV), (E = 3);
                            else if (d === "ZNEAR") (B = o.motion.NEARCLIP), (E = 3);
                            else if (d === "ZFAR") (B = o.motion.FARCLIP), (E = 3);
                            else if (d === "intensity") (B = o.motion.INTENSITY), (E = 3);
                            if (J && B < 3) J.method = o.light.method.DYNAMIC;
                            mCount = 0;
                            for (t = H.data.length; mCount < t; mCount++)
                                if (((k = null), typeof L.data[mCount] === "object")) {
                                    i = 0;
                                    for (iMax = L.data[mCount].length; i < iMax; i++)
                                        if (((J = i), c === 2 && i === 2 ? (J = 1) : c === 2 && i === 1 && (J = 2), (k = y.setKey(B, J, H.data[mCount], e.fixukaxis(a.up_axis, B, J, L.data[mCount][i]))), v))
                                            if (((d = v.data[mCount][i]), d === "LINEAR")) k.shape = o.envelope.shape.LINE;
                                            else if (d === "BEZIER") k.shape = !A && !w ? o.envelope.shape.LINEAR : o.envelope.shape.BEZI;
                                } else if (
                                    ((J = E),
                                    (ofs = 0),
                                    R && B === o.motion.ROT && c === 2 && J === 0 && (ofs = -90),
                                    B === o.motion.ROT
                                        ? (k = y.setKey(B, J, H.data[mCount], L.data[mCount] + ofs))
                                        : (c === 2 && E === 2 ? (J = 1) : c === 2 && E === 1 && (J = 2), (k = y.setKey(B, J, H.data[mCount], e.fixukaxis(a.up_axis, B, J, L.data[mCount])))),
                                    v)
                                )
                                    if (((d = v.data[mCount]), d === "LINEAR")) k.shape = o.envelope.shape.LINE;
                                    else if (d === "BEZIER")
                                        if (!A && !w) (k.shape = o.envelope.shape.LINEAR), (k.continutity = 1);
                                        else {
                                            k.shape = o.envelope.shape.BEZ2;
                                            d = D.data[mCount][0];
                                            var I,
                                                F = z.data[mCount][0];
                                            B === o.motion.ROT
                                                ? ((I = D.data[mCount][1]), (J = z.data[mCount][1]), (k.param[0] = d - k.time), (k.param[1] = I - k.value + ofs), (k.param[2] = F - k.time), (k.param[3] = J - k.value + ofs))
                                                : ((I = e.fixukaxis(a.up_axis, B, J, D.data[mCount][1])),
                                                  (J = e.fixukaxis(a.up_axis, B, J, z.data[mCount][1])),
                                                  (k.param[0] = d - k.time),
                                                  (k.param[1] = I - k.value),
                                                  (k.param[2] = F - k.time),
                                                  (k.param[3] = J - k.value));
                                        }
                        }
                    }
                }
            P = null;
            return (P = a.scene ? g[a.scene] : g.pop());
        },
        parseCollada: x,
    };
});
CubicVR.RegisterModule("CVRXML", function (u) {
    function x(a, h, d, n) {
        var t = CubicVR.util,
            s = null,
            e = null;
        n.triangles && (e = t.intDelimArray(b.getTextNode(n, "triangles"), " "));
        if (e && (n.segments && (s = t.intDelimArray(b.getTextNode(n, "segments"), " ")), s === null && (s = [0, parseInt(e.length / 3, 10)]), (n = 0), a.setFaceMaterial(h), e.length)) {
            p = 0;
            for (pMax = s.length; p < pMax; p += 2) {
                h = s[p + 1] * 3;
                a.setSegment(s[p]);
                j = n;
                for (jMax = n + h; j < jMax; j += 3) (t = a.addFace([e[j], e[j + 1], e[j + 2]])), d && a.faces[t].setUV([d[j], d[j + 1], d[j + 2]]);
                n += h;
            }
        }
    }
    function r(a) {
        var h = CubicVR.util,
            d = new CubicVR.UVMapper(),
            n = null,
            t = null;
        if (a.type)
            switch (((n = b.getTextNode(a, "type")), n)) {
                case "planar":
                    d.projection_mode = g.uv.projection.PLANAR;
                    break;
                case "cylindrical":
                    d.projection_mode = g.uv.projection.CYLINDRICAL;
                    break;
                case "spherical":
                    d.projection_mode = g.uv.projection.SPHERICAL;
                    break;
                case "cubic":
                    d.projection_mode = g.uv.projection.CUBIC;
            }
        if (!n) return null;
        n === "uv" && a.uv && (t = b.getPoints(a, "uv"));
        if (a.axis)
            switch (b.getTextNode(a, "axis")) {
                case "x":
                    d.projection_axis = g.uv.axis.X;
                    break;
                case "y":
                    d.projection_axis = g.uv.axis.Y;
                    break;
                case "z":
                    d.projection_axis = g.uv.axis.Z;
            }
        if (a.center) d.center = h.floatDelimArray(b.getTextNode(a, "center"));
        if (a.rotation) d.rotation = h.floatDelimArray(b.getTextNode(a, "rotation"));
        if (a.scale) d.scale = h.floatDelimArray(b.getTextNode(a, "scale"));
        if (a.wrap_w) d.wrap_w_count = parseFloat(b.getTextNode(a, "wrap_w"));
        if (a.wrap_h) d.wrap_h_count = parseFloat(b.getTextNode(a, "wrap_h"));
        return n !== "" && n !== "uv" ? d : t;
    }
    function o(c, h) {
        if (a[c] !== e) return a[c];
        var d = CubicVR.util,
            n,
            t,
            s,
            m;
        n = null;
        n = typeof c == "object" ? c : c.indexOf(".js") != -1 ? d.getJSON(c) : CubicVR.util.xml2badgerfish(d.getXML(c));
        if (n.root) n = n.root;
        if (n.properties) n = n.properties;
        d = new CubicVR.Mesh();
        n.points && (s = b.getPoints(n, "points")) && d.addPoint(s);
        var C = n.material;
        C && !C.length && (C = [C]);
        var q = [];
        if (C) {
            n = 0;
            for (s = C.length; n < s; n++) {
                var v = C[n],
                    o;
                o = v;
                var z = h,
                    A = new CubicVR.Material(o.name ? o.name.$ : null);
                if (o.shininess) A.shininess = b.getFloatNode(o, "shininess", A.shininess) / 100;
                A.opacity = b.getFloatNode(o, "alpha", A.opacity);
                A.max_smooth = b.getFloatNode(o, "max_smooth", A.max_smooth);
                A.color = b.getFloatDelimNode(o, "color", A.color);
                A.ambient = b.getFloatDelimNode(o, "ambient", A.ambient);
                A.diffuse = b.getFloatDelimNode(o, "diffuse", A.diffuse);
                A.specular = b.getFloatDelimNode(o, "specular", A.specular);
                t = void 0;
                if ((t = b.getTextNode(o, "texture"))) (t = (z ? z : "") + t), (tex = u.Textures_ref[t] !== e ? u.Textures_obj[u.Textures_ref[t]] : new CubicVR.Texture(t)), A.setTexture(tex, g.texture.map.COLOR);
                if ((t = b.getTextNode(o, "texture_luminosity"))) (t = (z ? z : "") + t), (tex = u.Textures_ref[t] !== e ? u.Textures_obj[u.Textures_ref[t]] : new CubicVR.Texture(t)), A.setTexture(tex, g.texture.map.AMBIENT);
                if ((t = b.getTextNode(o, "texture_normal"))) (t = (z ? z : "") + t), (tex = u.Textures_ref[t] !== e ? u.Textures_obj[u.Textures_ref[t]] : new CubicVR.Texture(t)), A.setTexture(tex, g.texture.map.NORMAL);
                if ((t = b.getTextNode(o, "texture_specular"))) (t = (z ? z : "") + t), (tex = u.Textures_ref[t] !== e ? u.Textures_obj[u.Textures_ref[t]] : new CubicVR.Texture(t)), A.setTexture(tex, g.texture.map.SPECULAR);
                if ((t = b.getTextNode(o, "texture_bump"))) (t = (z ? z : "") + t), (tex = u.Textures_ref[t] !== e ? u.Textures_obj[u.Textures_ref[t]] : new CubicVR.Texture(t)), A.setTexture(tex, g.texture.map.BUMP);
                if ((t = b.getTextNode(o, "texture_envsphere"))) (t = (z ? z : "") + t), (tex = u.Textures_ref[t] !== e ? u.Textures_obj[u.Textures_ref[t]] : new CubicVR.Texture(t)), A.setTexture(tex, g.texture.map.ENVSPHERE);
                if ((t = b.getTextNode(o, "texture_alpha"))) (t = (z ? z : "") + t), (tex = u.Textures_ref[t] !== e ? u.Textures_obj[u.Textures_ref[t]] : new CubicVR.Texture(t)), A.setTexture(tex, g.texture.map.ALPHA);
                o = A;
                var w = null;
                t = z = null;
                v.uvmapper && ((z = r(v.uvmapper)) && !z.length ? q.push([z, o]) : (t = z));
                (A = v.part) && !A.length && (A = [A]);
                if (A && A.length) {
                    var y = null,
                        R = null;
                    t = 0;
                    for (m = A.length; t < m; t++) {
                        var B = A[t],
                            y = null;
                        if ((w = B.uvmapper))
                            if (((y = r(w)), v.triangles))
                                (R = w = d.faces.length),
                                    y && !y.length
                                        ? (x(d, o, null, B), (R = d.faces.length - 1), d.calcFaceNormals(w, R), y.apply(d, o, e, w, R))
                                        : y && y.length
                                        ? x(d, o, y, B)
                                        : z && !z.length && (x(d, o, null, B), (R = d.faces.length - 1), d.calcFaceNormals(w, R), z.apply(d, o, e, w, R));
                        if (B.procedural) {
                            (w = B.uvmapper) && (y = r(w));
                            var R = B.transform ? b.getTransform(B.transform) : e,
                                w = e,
                                B = B.procedural,
                                E = b.getTextNode(B, "type");
                            R && ((w = new CubicVR.Transform()), w.translate(R.position), w.pushMatrix(), w.rotate(R.rotation), w.pushMatrix(), w.scale(R.scale));
                            z || (z = e);
                            y = { material: o, uvmapper: z || y };
                            if (E === "box" || E === "cube") (y.size = b.getFloatNode(B, "size")), d.booleanAdd(CubicVR.primitives.box(y), w);
                            else if (E === "sphere") (y.radius = b.getFloatNode(B, "radius")), (y.lat = b.getIntNode(B, "lat")), (y.lon = b.getIntNode(B, "lon")), d.booleanAdd(CubicVR.primitives.sphere(y), w);
                            else if (E === "cone") (y.base = b.getFloatNode(B, "base")), (y.height = b.getFloatNode(B, "height")), (y.lon = b.getIntNode(B, "lon")), d.booleanAdd(CubicVR.primitives.cone(y), w);
                            else if (E === "plane") (y.size = b.getFloatNode(B, "size")), d.booleanAdd(CubicVR.primitives.plane(y), w);
                            else if (E === "cylinder") (y.radius = b.getFloatNode(B, "radius")), (y.height = b.getFloatNode(B, "height")), (y.lon = b.getIntNode(B, "lon")), d.booleanAdd(CubicVR.primitives.cylinder(y), w);
                            else if (E === "torus")
                                (y.innerRadius = b.getFloatNode(B, "innerRadius")),
                                    (y.outerRadius = b.getFloatNode(B, "outerRadius")),
                                    (y.lat = b.getIntNode(B, "lat")),
                                    (y.lon = b.getIntNode(B, "lon")),
                                    d.booleanAdd(CubicVR.primitives.torus(y), w);
                            else if (E === "lathe") (y.points = b.getPoints(B, "p")), (y.lon = b.getIntNode(B, "lon")), d.booleanAdd(CubicVR.primitives.lathe(y), w);
                            else if (E === "polygon") {
                                R = b.getPoints(B, "p");
                                R = new CubicVR.Polygon(R);
                                (E = B.cut) && !E.length && (E = [E]);
                                if (E.length) {
                                    t = 0;
                                    for (s = E.length; t < m; t++) R.cut(new CubicVR.Polygon(b.getPoints(E[t])));
                                }
                                y.front = 0;
                                y.back = 0;
                                y.frontShift = 0;
                                y.backShift = 0;
                                y.frontDepth = 0;
                                y.backDepth = 0;
                                if (B.extrude) {
                                    B = B.extrude;
                                    y.front = b.getFloatNode(B, "front", 0);
                                    y.back = b.getFloatNode(B, "back", 0);
                                    y.frontShift = b.getFloatNode(B, "frontBevelShift", 0);
                                    y.backShift = b.getFloatNode(B, "backBevelShift", 0);
                                    y.frontDepth = b.getFloatNode(B, "frontBevelDepth", 0);
                                    y.backDepth = b.getFloatNode(B, "backBevelDepth", 0);
                                    y.depth = b.getFloatNode(B, "depth", 0);
                                    y.shift = b.getFloatNode(B, "shift", 0);
                                    y.bevel = b.getFloatNode(B, "bevel", 0);
                                    if (y.depth && !y.backDepth && !y.frontDepth) (y.front = -y.depth / 2), (y.back = y.depth / 2);
                                    if (y.shift && !y.backShift && !y.frontShift) (y.frontShift = y.shift), (y.backShift = y.shift);
                                    if (y.bevel && !y.backDepth && !y.frontDepth) (y.frontDepth = y.bevel), (y.backDepth = y.bevel);
                                }
                                B = R.toExtrudedBeveledMesh(new CubicVR.Mesh(), y);
                                B.setFaceMaterial(y.material);
                                d.booleanAdd(B, w);
                            }
                        }
                    }
                } else x(d, o, t, v);
            }
        }
        d.triangulateQuads();
        d.calcNormals();
        n = 0;
        for (s = q.length; n < s; n++) q[n][0].apply(d, q[n][1]);
        d.compile();
        return (a[c] = d);
    }
    function q(a) {
        if (a === null) return !1;
        return a.getElementsByTagName("x").length || a.getElementsByTagName("y").length || a.getElementsByTagName("z").length || a.getElementsByTagName("fov").length;
    }
    function m(a, b, d) {
        var n = CubicVR.util,
            t = [];
        t[0] = a.getElementsByTagName("x");
        t[1] = a.getElementsByTagName("y");
        t[2] = a.getElementsByTagName("z");
        t[3] = a.getElementsByTagName("fov");
        var s, m, C, o, v, q;
        for (q in t)
            if (t.hasOwnProperty(q) && t[q] !== e && t[q].length) {
                s = t[q][0].getElementsByTagName("time");
                m = t[q][0].getElementsByTagName("value");
                C = t[q][0].getElementsByTagName("in");
                o = t[q][0].getElementsByTagName("out");
                v = t[q][0].getElementsByTagName("tcb");
                var r = null,
                    A = null,
                    w = null,
                    y = (a = null);
                C.length && (a = n.collectTextNode(C[0]));
                o.length && (y = n.collectTextNode(o[0]));
                s.length && (r = n.floatDelimArray(n.collectTextNode(s[0]), " "));
                m.length && (A = n.floatDelimArray(n.collectTextNode(m[0]), " "));
                v.length && (w = n.floatDelimArray(n.collectTextNode(v[0]), " "));
                if (r !== null && A !== null) {
                    s = 0;
                    for (m = r.length; s < m; s++) if (((C = d.setKey(b, q, r[s], A[s])), w)) (C.tension = w[s * 3]), (C.continuity = w[s * 3 + 1]), (C.bias = w[s * 3 + 2]);
                }
                A = r = g.envelope.behavior.CONSTANT;
                if (a)
                    switch (a) {
                        case "reset":
                            r = g.envelope.behavior.RESET;
                            break;
                        case "constant":
                            r = g.envelope.behavior.CONSTANT;
                            break;
                        case "repeat":
                            r = g.envelope.behavior.REPEAT;
                            break;
                        case "oscillate":
                            r = g.envelope.behavior.OSCILLATE;
                            break;
                        case "offset":
                            r = g.envelope.behavior.OFFSET;
                            break;
                        case "linear":
                            r = g.envelope.behavior.LINEAR;
                    }
                if (y)
                    switch (y) {
                        case "reset":
                            A = g.envelope.behavior.RESET;
                            break;
                        case "constant":
                            A = g.envelope.behavior.CONSTANT;
                            break;
                        case "repeat":
                            A = g.envelope.behavior.REPEAT;
                            break;
                        case "oscillate":
                            A = g.envelope.behavior.OSCILLATE;
                            break;
                        case "offset":
                            A = g.envelope.behavior.OFFSET;
                            break;
                        case "linear":
                            A = g.envelope.behavior.LINEAR;
                    }
                d.setBehavior(b, q, r, A);
            }
    }
    var e = u.undef,
        g = CubicVR.enums,
        a = [],
        b = {
            getPoints: function (a, h, d) {
                a = h ? b.getTextNode(a, h) : a.$;
                if (!a) return e;
                a = a.split(" ");
                i = 0;
                for (iMax = a.length; i < iMax; i++) {
                    a[i] = a[i].split(",");
                    j = 0;
                    for (jMax = a[i].length; j < jMax; j++) a[i][j] = parseFloat(a[i][j]);
                    d && (a[i][2] = 0);
                }
                return a;
            },
            getTransform: function (a) {
                var b = CubicVR.util;
                if (!a) return null;
                var d = { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                    n;
                postition = a.position;
                n = a.rotation;
                a = a.scale;
                if (n) d.rotation = b.floatDelimArray(n.$);
                if (a) d.scale = b.floatDelimArray(a.$);
                if (n || a) return d;
                return null;
            },
            getTextNode: function (a, b, d) {
                a = a[b];
                if (!a) return d;
                a.length && (a = a[0]);
                if (a.$) return a.$;
                return d;
            },
            getFloatNode: function (a, h, d) {
                if ((a = b.getTextNode(a, h))) {
                    a = parseFloat(a);
                    if (a != a) return d;
                    return a;
                }
                return d;
            },
            getIntNode: function (a, h, d) {
                if ((a = b.getTextNode(a, h))) {
                    a = parseInt(a, 10);
                    if (a != a) return d;
                    return a;
                }
                return d;
            },
            getFloatDelimNode: function (a, h, d, n) {
                var t = CubicVR.util;
                if ((a = b.getTextNode(a, h))) return t.floatDelimArray(a, n);
                return d;
            },
            getIntDelimNode: function (a, h, d, n) {
                var t = CubicVR.util;
                if ((a = b.getTextNode(a, h))) return t.intDelimArray(a, n);
                return d;
            },
        };
    return {
        loadMesh: o,
        loadScene: function (a, b, d) {
            var n = CubicVR.util;
            b === e && (b = "");
            d === e && (d = "");
            for (var t = new CubicVR.Mesh(), s = n.getXML(a), a = new CubicVR.Scene(), H = [], C = s.getElementsByTagName("sceneobjects"), r, v, D, z = 0, A = C[0].childNodes.length; z < A; z++) {
                var w = C[0].childNodes[z];
                if (w.tagName === "sceneobject") {
                    var y = "unnamed",
                        x = "",
                        B = "",
                        t = w.getElementsByTagName("name");
                    t.length && (y = n.collectTextNode(t[0]));
                    t = w.getElementsByTagName("parent");
                    t.length && (x = n.collectTextNode(t[0]));
                    t = w.getElementsByTagName("model");
                    t.length && (B = n.collectTextNode(t[0]));
                    D = v = r = null;
                    t = w.getElementsByTagName("position");
                    t.length && (r = t[0]);
                    t = w.getElementsByTagName("rotation");
                    t.length && (v = t[0]);
                    t = w.getElementsByTagName("scale");
                    t.length && (D = t[0]);
                    t = null;
                    B !== "" && (t = o(b + B, d));
                    t = new CubicVR.SceneObject(t, y);
                    if (q(r)) {
                        if (!t.motion) t.motion = new CubicVR.Motion();
                        m(r, g.motion.POS, t.motion);
                    } else if (r) t.position = n.floatDelimArray(n.collectTextNode(r));
                    if (q(v)) {
                        if (!t.motion) t.motion = new CubicVR.Motion();
                        m(v, g.motion.ROT, t.motion);
                    } else t.rotation = n.floatDelimArray(n.collectTextNode(v));
                    if (q(D)) {
                        if (!t.motion) t.motion = new CubicVR.Motion();
                        m(D, g.motion.SCL, t.motion);
                    } else t.scale = n.floatDelimArray(n.collectTextNode(D));
                    a.bindSceneObject(t);
                    x !== "" && H.push([t, x]);
                }
            }
            for (var u in H) H.hasOwnProperty(u) && a.getSceneObject(H[u][1]).bindChild(H[u][0]);
            b = s.getElementsByTagName("camera");
            if (b.length) {
                v = r = null;
                d = "";
                t = b[0].getElementsByTagName("name");
                u = a.camera;
                s = null;
                if (t.length) d = t[0].firstChild.nodeValue;
                t = b[0].getElementsByTagName("target");
                if (t.length) d = t[0].firstChild.nodeValue;
                if (d !== "") u.targetSceneObject = a.getSceneObject(d);
                t = b[0].getElementsByTagName("position");
                t.length && (r = t[0]);
                t = b[0].getElementsByTagName("rotation");
                t.length && (v = t[0]);
                t = b[0].getElementsByTagName("fov");
                t.length && (s = t[0]);
                if (q(r)) {
                    if (!u.motion) u.motion = new CubicVR.Motion();
                    m(r, g.motion.POS, u.motion);
                } else if (r) u.position = n.floatDelimArray(r.firstChild.nodeValue);
                if (q(v)) {
                    if (!u.motion) u.motion = new CubicVR.Motion();
                    m(v, g.motion.ROT, u.motion);
                } else if (v) u.rotation = n.floatDelimArray(v.firstChild.nodeValue);
                if (q(s)) {
                    if (!u.motion) u.motion = new CubicVR.Motion();
                    m(s, g.motion.FOV, u.motion);
                } else if (s) u.fov = parseFloat(s.firstChild.nodeValue);
            }
            return a;
        },
    };
});
CubicVR.RegisterModule("Camera", function (u) {
    function x(a, b, c, h, d) {
        var n = CubicVR.mat4;
        this.frustum = new CubicVR.Frustum();
        typeof a == "object"
            ? ((this.position = a.position ? a.position : [0, 0, 0]),
              (this.rotation = a.rotation ? a.rotation : [0, 0, 0]),
              (this.target = a.target ? a.target : [0, 0, 0]),
              (this.fov = a.fov ? a.fov : 60),
              (this.nearclip = a.nearclip ? a.nearclip : 0.1),
              (this.farclip = a.farclip ? a.farclip : 400),
              (this.targeted = a.targeted ? a.targeted : !0),
              (this.calc_nmatrix = a.calcNormalMatrix ? a.calcNormalMatrix : !0),
              (this.name = a.name || "camera" + g),
              (b = a.height ? a.height : q),
              (a = a.width ? a.width : q))
            : ((this.position = [0, 0, 0]),
              (this.rotation = [0, 0, 0]),
              (this.target = [0, 0, 0]),
              (this.fov = c !== q ? c : 60),
              (this.nearclip = h !== q ? h : 0.1),
              (this.farclip = d !== q ? d : 400),
              (this.calc_nmatrix = this.targeted = !0),
              (this.name = "camera" + g));
        this.motion = this.targetSceneObject = null;
        this.transform = new CubicVR.Transform();
        this.manual = !1;
        this.setDimensions(a !== q ? a : 512, b !== q ? b : 512);
        this.mvMatrix = n.identity();
        this.pMatrix = null;
        this.calcProjection();
        this.ortho = !1;
        this.ortho_view = { left: -1, right: 1, bottom: -1, top: 1 };
        this.parent = null;
        ++g;
    }
    function r(a) {
        this.position = a !== q ? a : [0, 0, 0];
    }
    function o(a, b, c) {
        this.camPath = new CubicVR.Motion();
        this.targetPath = new CubicVR.Motion();
        this.start_position = a !== q ? a : [8, 8, 8];
        this.target = b !== q ? b : [0, 0, 0];
        this.bounds =
            c !== q
                ? c
                : [
                      [-15, 3, -15],
                      [15, 20, 15],
                  ];
        this.safe_bb = [];
        this.avoid_sphere = [];
        this.segment_time = 3;
        this.buffer_time = 20;
        this.path_length = this.path_time = this.current_time = this.start_time = 0;
        this.min_distance = 2;
        this.angle_min = this.max_distance = 40;
        this.angle_max = 180;
    }
    var q = u.undef,
        m = CubicVR.enums,
        e = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        g = 0;
    x.prototype = {
        setParent: function (a) {
            this.parent = a;
        },
        setOrtho: function (a, b, c, h) {
            this.ortho = !0;
            this.ortho_view.left = a;
            this.ortho_view.right = b;
            this.ortho_view.bottom = c;
            this.ortho_view.top = h;
        },
        control: function (a, b, c) {
            a === m.motion.ROT
                ? (this.rotation[b] = c)
                : a === m.motion.POS
                ? (this.position[b] = c)
                : a === m.motion.FOV
                ? this.setFOV(c)
                : a === m.motion.LENS
                ? this.setLENS(c)
                : a === m.motion.NEARCLIP
                ? this.setClip(c, this.farclip)
                : a === m.motion.FARCLIP && this.setClip(this.nearclip, c);
        },
        makeFrustum: function (a, b, c, h, d, n) {
            return [(2 * d) / (b - a), 0, 0, 0, 0, (2 * d) / (h - c), 0, 0, (b + a) / (b - a), (h + c) / (h - c), -(n + d) / (n - d), -1, 0, 0, (-2 * n * d) / (n - d), 0];
        },
        setTargeted: function (a) {
            this.targeted = a;
        },
        calcProjection: function () {
            var a = CubicVR.mat4,
                b = CubicVR.mat3;
            this.pMatrix = this.ortho ? a.ortho(this.ortho_view.left, this.ortho_view.right, this.ortho_view.bottom, this.ortho_view.top, this.nearclip, this.farclip) : a.perspective(this.fov, this.aspect, this.nearclip, this.farclip);
            if (!this.targeted)
                a.identity(this.mvMatrix),
                    a.rotate(-this.rotation[0], -this.rotation[1], -this.rotation[2], this.mvMatrix),
                    a.translate(-this.position[0], -this.position[1], -this.position[2], this.mvMatrix),
                    this.parent !== null && a.multiply(this.mvMatrix.slice(0), a.inverse(this.parent.tMatrix), this.mvMatrix),
                    this.calc_nmatrix ? ((this.nMatrix = a.inverse_mat3(this.mvMatrix)), b.transpose_inline(this.nMatrix)) : a.identity(this.nMatrix);
            this.frustum.extract(this, this.mvMatrix, this.pMatrix);
        },
        setClip: function (a, b) {
            this.nearclip = a;
            this.farclip = b;
            this.calcProjection();
        },
        setDimensions: function (a, b) {
            this.width = a;
            this.height = b;
            this.aspect = a / b;
            this.calcProjection();
        },
        resize: function (a, b) {
            this.setDimensions(a, b);
        },
        setFOV: function (a) {
            this.fov = a;
            this.ortho = !1;
            this.calcProjection();
        },
        setLENS: function (a) {
            this.setFOV(2 * Math.atan(16 / a) * (180 / Math.PI));
        },
        lookat: function (a, b, c, h, d, n, t, s, g) {
            var m = CubicVR.mat4,
                q = CubicVR.mat3;
            if (typeof a == "object") this.lookat(this.position[0], this.position[1], this.position[2], a[0], a[1], a[2], 0, 1, 0);
            else {
                this.mvMatrix = m.lookat(a, b, c, h, d, n, t, s, g);
                if (this.rotation[2]) this.transform.clearStack(), this.transform.rotate(-this.rotation[2], 0, 0, 1), this.transform.pushMatrix(this.mvMatrix), (this.mvMatrix = this.transform.getResult());
                this.calc_nmatrix ? ((this.nMatrix = m.inverse_mat3(this.mvMatrix)), q.transpose_inline(this.nMatrix)) : (this.nMatrix = e);
                this.frustum.extract(this, this.mvMatrix, this.pMatrix);
            }
        },
        unProject: function (a, b, c) {
            var h = CubicVR.mat4,
                d = CubicVR.vec3,
                n = [0, 0, this.width, this.height],
                a = h.vec4_multiply(h.vec4_multiply([((a - n[0]) / n[2]) * 2 - 1, -(((b - n[1]) / n[3]) * 2 - 1), 1, 1], h.inverse(this.pMatrix)), h.inverse(this.mvMatrix)),
                a = [a[0] / a[3], a[1] / a[3], a[2] / a[3]];
            if (c !== q) return d.add(this.position, d.multiply(d.normalize(d.subtract(a, this.position)), c));
            return a;
        },
        project: function (a, b, c) {
            var h = CubicVR.mat4,
                a = h.vec4_multiply(h.vec4_multiply([a, b, c, 1], this.mvMatrix), this.pMatrix);
            return [((a[0] / a[3] + 1) / 2) * this.width, ((-a[1] / a[3] + 1) / 2) * this.height, (a[2] / a[3]) * (this.farclip - this.nearclip) + this.nearclip];
        },
    };
    r.prototype = {
        control: function (a, b, c) {
            a === m.motion.POS && (this.position[b] = c);
        },
    };
    o.prototype = {
        inBounds: function (a) {
            var b = CubicVR.vec3;
            if (!(a[0] > this.bounds[0][0] && a[1] > this.bounds[0][1] && a[2] > this.bounds[0][2] && a[0] < this.bounds[1][0] && a[1] < this.bounds[1][1] && a[2] < this.bounds[1][2])) return !1;
            for (var c = 0, h = this.avoid_sphere.length; c < h; c++) if (b.length(a, this.avoid_sphere[c][0]) < this.avoid_sphere[c][1]) return !1;
            return !0;
        },
        findNextNode: function (a, b) {
            var c = CubicVR.vec3,
                h = [0, 0, 0],
                d = [0, 0, 0],
                n = (h = 0),
                t = !1;
            do
                if (
                    ((d[0] = Math.random() - 0.5),
                    (d[1] = Math.random() - 0.5),
                    (d[2] = Math.random() - 0.5),
                    (d = c.normalize(d)),
                    (h = Math.random() * (this.max_distance - this.min_distance) + this.min_distance),
                    (h = c.add(b.position, c.multiply(d, h))),
                    (t = this.inBounds(h)),
                    n++,
                    n > 30)
                ) {
                    h = b.position;
                    break;
                }
            while (!t);
            return h;
        },
        run: function (a) {
            this.current_time = a;
            if (this.path_time === 0)
                (this.path_time = this.current_time),
                    this.camPath.setKey(m.motion.POS, m.motion.X, this.path_time, this.start_position[0]),
                    this.camPath.setKey(m.motion.POS, m.motion.Y, this.path_time, this.start_position[1]),
                    this.camPath.setKey(m.motion.POS, m.motion.Z, this.path_time, this.start_position[2]);
            for (; this.path_time < this.current_time + this.buffer_time; ) {
                this.path_time += this.segment_time;
                var b = new r(),
                    c = new r();
                this.path_length && this.camPath.apply(this.path_time - this.segment_time * 2, b);
                this.camPath.apply(this.path_time - this.segment_time, c);
                b = this.findNextNode(b, c);
                this.camPath.setKey(m.motion.POS, m.motion.X, this.path_time, b[0]);
                this.camPath.setKey(m.motion.POS, m.motion.Y, this.path_time, b[1]);
                this.camPath.setKey(m.motion.POS, m.motion.Z, this.path_time, b[2]);
                this.path_length++;
            }
            b = new r();
            this.camPath.apply(a, b);
            return b.position;
        },
        addSafeBound: function (a, b) {
            this.safe_bb.push([a, b]);
        },
        addAvoidSphere: function (a, b) {
            this.avoid_sphere.push([a, b]);
        },
    };
    return { Camera: x, AutoCamera: o };
});
CubicVR.RegisterModule("CollisionMap", function () {
    CubicVR.enums.collision = { shape: { BOX: 0, SPHERE: 1, CYLINDER: 2, CONE: 3, CAPSULE: 4, MESH: 5, HEIGHTFIELD: 6 } };
    var u = function (x) {
        this.shapes = [];
        this.result = null;
        if (x) {
            x && !x.length && (x = [x]);
            for (var r = 0, o = x.length; r < o; r++) this.addShape(x[r]);
        }
    };
    u.prototype = {
        addShape: function (x) {
            x.position = x.position || [0, 0, 0];
            x.rotation = x.rotation || [0, 0, 0];
            x.size = x.size || [1, 1, 1];
            x.radius = x.radius || 1;
            x.height = x.height || 1;
            x.margin = x.margin || 0;
            x.mesh = x.mesh || null;
            this.shapes.push(x);
        },
        getShapes: function () {
            return this.shapes;
        },
        setResult: function (x) {
            this.result = x;
        },
        getResult: function () {
            return this.result;
        },
    };
    return { CollisionMap: u };
});
CubicVR.RegisterModule("GML", function (u) {
    function x(o) {
        var q = CubicVR.util;
        this.strokes = [];
        this.bounds = [1, 1, 1];
        this.origin = [0, 0, 0];
        this.upvector = [0, 1, 0];
        this.viewvector = [0, 0, 1];
        this.manual_pos = 0;
        if (o !== r) {
            var o = q.getXML(o),
                m = o.getElementsByTagName("header");
            if (!m.length) return null;
            var e = m[0],
                m = o.getElementsByTagName("environment");
            if (!m.length) return null;
            this.name = null;
            e = e.getElementsByTagName("name");
            if (e.length) this.name = q.collectTextNode(e[0]);
            e = m[0].getElementsByTagName("screenBounds");
            if (e.length) this.bounds = [parseFloat(q.collectTextNode(e[0].getElementsByTagName("x")[0])), parseFloat(q.collectTextNode(e[0].getElementsByTagName("y")[0])), parseFloat(q.collectTextNode(e[0].getElementsByTagName("z")[0]))];
            e = m[0].getElementsByTagName("origin");
            if (e.length) this.origin = [parseFloat(q.collectTextNode(e[0].getElementsByTagName("x")[0])), parseFloat(q.collectTextNode(e[0].getElementsByTagName("y")[0])), parseFloat(q.collectTextNode(e[0].getElementsByTagName("z")[0]))];
            m = m[0].getElementsByTagName("up");
            if (m.length)
                this.upvector = [parseFloat(q.collectTextNode(m[0].getElementsByTagName("x")[0])), parseFloat(q.collectTextNode(m[0].getElementsByTagName("y")[0])), parseFloat(q.collectTextNode(m[0].getElementsByTagName("z")[0]))];
            o = o.getElementsByTagName("drawing");
            m = 0;
            for (e = o.length; m < e; m++)
                for (var g = o[m].getElementsByTagName("stroke"), a = 0, b = 0, c = 0, h = 0, d = 0, n = g.length; d < n; d++) {
                    for (var t = g[d].getElementsByTagName("pt"), s = t.length, H = Array(s), C, L, v, D = 0, z = s; D < z; D++)
                        (v = t[D]),
                            (s = parseFloat(q.collectTextNode(v.getElementsByTagName("x")[0]))),
                            (C = parseFloat(q.collectTextNode(v.getElementsByTagName("y")[0]))),
                            (L = parseFloat(q.collectTextNode(v.getElementsByTagName("z")[0]))),
                            (v = parseFloat(q.collectTextNode(v.getElementsByTagName("time")[0]))),
                            this.upvector[0] === 1
                                ? (H[D] = [C !== C ? 0 : C, s !== s ? 0 : -s, L !== L ? 0 : L, v])
                                : this.upvector[1] === 1
                                ? (H[D] = [s !== s ? 0 : s, C !== C ? 0 : C, L !== L ? 0 : L, v])
                                : this.upvector[2] === 1 && (H[D] = [s !== s ? 0 : s, L !== L ? 0 : -L, C !== C ? 0 : C, v]),
                            a < s && (a = s),
                            b < C && (b = C),
                            c < L && (c = L),
                            h < v && (h = v);
                    if (c > h) {
                        t = 0;
                        for (D = H.length; t < D; t++) (s = H[t][3]), (H[t][3] = H[t][2]), (H[t][2] = s / this.bounds[2]);
                    }
                    this.strokes[d] = H;
                }
        }
    }
    var r = u.undef;
    x.prototype = {
        addStroke: function (o, q) {
            var m = [];
            q === r && (q = 0.1);
            for (var e = 0, g = o.length; e < g; e++) {
                var a = [o[e][0], o[e][1], o[e][2]];
                this.manual_pos += q;
                a.push(this.manual_pos);
                m.push(a);
            }
            this.strokes.push(m);
        },
        recenter: function () {
            var o = CubicVR.vec3,
                q = [0, 0, 0],
                m = [this.strokes[0][0][0], this.strokes[0][0][1], this.strokes[0][0][2]],
                e,
                g,
                a,
                b;
            a = 0;
            for (b = this.strokes.length; a < b; a++) {
                e = 0;
                for (g = this.strokes[a].length; e < g; e++)
                    q[0] > this.strokes[a][e][0] && (q[0] = this.strokes[a][e][0]),
                        q[1] > this.strokes[a][e][1] && (q[1] = this.strokes[a][e][1]),
                        q[2] > this.strokes[a][e][2] && (q[2] = this.strokes[a][e][2]),
                        m[0] < this.strokes[a][e][0] && (m[0] = this.strokes[a][e][0]),
                        m[1] < this.strokes[a][e][1] && (m[1] = this.strokes[a][e][1]),
                        m[2] < this.strokes[a][e][2] && (m[2] = this.strokes[a][e][2]);
            }
            o = o.multiply(o.subtract(m, q), 0.5);
            a = 0;
            for (b = this.strokes.length; a < b; a++) {
                e = 0;
                for (g = this.strokes[a].length; e < g; e++) (this.strokes[a][e][0] -= o[0]), (this.strokes[a][e][1] -= this.upvector[1] ? o[1] : -o[1]), (this.strokes[a][e][2] -= o[2]);
            }
        },
        generateObject: function (o, q, m, e, g) {
            var a = CubicVR.vec3;
            o === r && (o = 0);
            q === r && (q = 0);
            g === r && (g = !1);
            e === r && (e = 0.02);
            m === r && (m = 0.015);
            for (var b = q !== 0, c = 0, h = 0, d = new CubicVR.Mesh(this.name), n, t, s, H, C, L, v = 0, D = this.strokes.length; v < D; v++) {
                L = new CubicVR.Envelope();
                var z = new CubicVR.Envelope(),
                    A = new CubicVR.Envelope(),
                    w = this.strokes[v].length,
                    y = 0,
                    x = [],
                    B = [],
                    u = 0,
                    P = this.strokes[v];
                for (C = 0; C < w; C++) {
                    var J = P[C],
                        I = L.addKey(J[3], J[0]),
                        F = z.addKey(J[3], J[1]),
                        G;
                    G = g ? A.addKey(J[3], J[2]) : A.addKey(J[3], 0);
                    I.tension = 0.5;
                    F.tension = 0.5;
                    G.tension = 0.5;
                    C !== 0 ? ((n = J[0] - n), (t = J[1] - t), (s = J[2] - s), (H = J[3] - H), (s = Math.sqrt(n * n + t * t + s * s)), (y += s), (x[C - 1] = s), (B[C - 1] = H)) : (u = J[3]);
                    n = J[0];
                    t = J[1];
                    s = J[2];
                    H = J[3];
                }
                y = u;
                w = d.points.length;
                for (C = 0; C < x.length; C++) {
                    u = B[C];
                    P = y;
                    J = y + u;
                    for (I = u / Math.ceil((x[C] / e) * 3); P < J - I; P += I) {
                        P === y && ((n = L.evaluate(P)), (t = z.evaluate(P)), (s = A.evaluate(P)));
                        var O,
                            F = L.evaluate(P + I);
                        G = z.evaluate(P + I);
                        O = A.evaluate(P + I);
                        var K;
                        K = a.multiply(a.normalize(a.cross(this.viewvector, a.normalize([F - n, G - t, O - s]))), m / 2);
                        d.addPoint([n - K[0], -(t - K[1]), s - K[2] + (b ? q / 2 : 0)]);
                        d.addPoint([n + K[0], -(t + K[1]), s + K[2] + (b ? q / 2 : 0)]);
                        n = F;
                        t = G;
                        s = O;
                    }
                    y += u;
                }
                z = d.points.length;
                if (b) {
                    C = w;
                    for (L = z; C < L; C++) d.addPoint([d.points[C][0], d.points[C][1], d.points[C][2] - (b ? q / 2 : 0)]);
                }
                C = 0;
                for (L = z - w; C <= L - 4; C += 2)
                    c % o === 0 && h++,
                        d.setSegment(h),
                        (A = [w + C, w + C + 1, w + C + 3, w + C + 2]),
                        d.addFace(A),
                        b &&
                            ((A = [A[3] + z - w, A[2] + z - w, A[1] + z - w, A[0] + z - w]),
                            d.addFace(A),
                            (A = [w + C, w + C + 2, w + C + 2 + z - w, w + C + z - w]),
                            d.addFace(A),
                            (A = [w + C + 1 + z - w, w + C + 3 + z - w, w + C + 3, w + C + 1]),
                            d.addFace(A),
                            C === 0 && ((A = [w + C + z - w, w + C + 1 + z - w, w + C + 1, w + C]), d.addFace(A)),
                            C === L - 4 && ((A = [w + C + 2, w + C + 3, w + C + 3 + z - w, w + C + 2 + z - w]), d.addFace(A))),
                        c++;
            }
            d.calcFaceNormals();
            d.triangulateQuads();
            d.calcNormals();
            d.compile();
            return d;
        },
    };
    return { GML: x };
});
CubicVR.RegisterModule("Landscape", function (u) {
    function x(m, e, g, a) {
        this.doTransform = function () {};
        this.tMatrix = o;
        this.parent = null;
        this.position = [0, 0, 0];
        this.scale = [1, 1, 1];
        this.size = m;
        this.divisions_w = e;
        this.divisions_h = g;
        this.matRef = a;
        this.children = null;
        this.obj = new CubicVR.Mesh();
        this.divisions_w > this.divisions_h
            ? ((this.size_w = m), (this.size_h = (m / this.divisions_w) * this.divisions_h))
            : ((this.size_w = this.divisions_h > this.divisions_w ? (m / this.divisions_h) * this.divisions_w : m), (this.size_h = m));
        for (e = -(this.size_h / 2); e < this.size_h / 2; e += this.size_h / this.divisions_h)
            for (m = -(this.size_w / 2); m < this.size_w / 2; m += this.size_w / this.divisions_w) this.obj.addPoint([m + this.size_w / this.divisions_w / 2, 0, e + this.size_h / this.divisions_h / 2]);
        this.obj.setFaceMaterial(this.matRef);
        for (e = 0; e < this.divisions_h - 1; e++)
            for (m = 0; m < this.divisions_w - 1; m++)
                this.obj.addFace([m + (e + 1) * this.divisions_w, m + 1 + e * this.divisions_w, m + e * this.divisions_w]),
                    this.obj.addFace([m + (e + 1) * this.divisions_w, m + 1 + (e + 1) * this.divisions_w, m + 1 + e * this.divisions_w]);
    }
    var r = u.undef,
        o = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        q = Math.PI / 2;
    x.prototype = {
        getMesh: function () {
            return this.obj;
        },
        setIndexedHeight: function (m, e, g) {
            obj.points[m + e * this.divisions_w][1] = g;
        },
        mapGen: function (m, e, g, a, b) {
            if (e !== r && g !== r && a !== r && b !== r) {
                if (!(e >= this.divisions_w) && !(g >= this.divisions_h) && (e + a >= this.divisions_w && (a = this.divisions_w - 1 - e), g + b >= this.divisions_h && (b = this.divisions_h - 1 - g), !(a <= 0 || b <= 0)))
                    for (var c = e, a = e + a; c < a; c++) for (var h = g, d = g + b; h < d; h++) (e = this.obj.points[c + h * this.divisions_w]), (e[1] = m(e[0], e[2]));
            } else {
                g = 0;
                for (b = this.obj.points.length; g < b; g++) (e = this.obj.points[g]), (e[1] = m(e[0], e[2]));
            }
        },
        getFaceAt: function (m, e) {
            if (typeof m === "object") return this.getFaceAt(m[0], m[2]);
            var g = this.size_h / 2 - this.size_h / this.divisions_h / 2,
                a = parseInt(Math.floor(((m + (this.size_w / 2 - this.size_w / this.divisions_w / 2)) / this.size_w) * this.divisions_w), 10),
                g = parseInt(Math.floor(((e + g) / this.size_h) * this.divisions_h), 10);
            if (a < 0) return -1;
            if (a >= this.divisions_w - 1) return -1;
            if (g < 0) return -1;
            if (g >= this.divisions_h - 1) return -1;
            var a = parseInt(a + g * (this.divisions_w - 1), 10) * 2,
                g = parseInt(a + 1, 10),
                b = this.obj.points[this.obj.faces[a].points[0]];
            return Math.abs(e - b[2]) / Math.abs(m - b[0]) >= 1 ? a : g;
        },
        getHeightValue: function (m, e) {
            var g = CubicVR.triangle;
            if (typeof m === "object") return this.getHeightValue(m[0], m[2]);
            var a,
                b = this.getFaceAt(m, e);
            if (b === -1) return 0;
            a = this.obj.points[this.obj.faces[b].points[0]];
            var c = g.normal(this.obj.points[this.obj.faces[b].points[0]], this.obj.points[this.obj.faces[b].points[1]], this.obj.points[this.obj.faces[b].points[2]]),
                g = c[0],
                b = c[1],
                c = c[2];
            return (g * m + c * e + (-(g * a[0]) - b * a[1] - c * a[2])) / -b;
        },
        orient: function (m, e, g, a, b, c) {
            c === r && (c = 0);
            var h,
                d,
                n = [];
            h = g / 2;
            var t = a / 2;
            d = Math.sqrt(t * t + h * h);
            t = Math.atan2(t, h);
            b *= Math.PI / 180;
            h = m + Math.sin(b) * c;
            c = e + Math.cos(b) * c;
            n[0] = this.getHeightValue([h + d * Math.cos(-t - q + b), 0, c + d * -Math.sin(-t - q + b)]);
            n[1] = this.getHeightValue([h + d * Math.cos(t - q + b), 0, c + d * -Math.sin(t - q + b)]);
            n[2] = this.getHeightValue([h + d * Math.cos(-t + q + b), 0, c + d * -Math.sin(-t + q + b)]);
            n[3] = this.getHeightValue([h + d * Math.cos(t + q + b), 0, c + d * -Math.sin(t + q + b)]);
            d = -Math.atan2(n[1] - n[2], g);
            c = -Math.atan2(n[0] - n[1], a);
            d += -Math.atan2(n[0] - n[3], g);
            c += -Math.atan2(n[3] - n[2], a);
            d /= 2;
            c /= 2;
            return [
                [m, (n[2] + n[3] + n[1] + n[0]) / 4, e],
                [d * (180 / Math.PI), b, c * (180 / Math.PI)],
            ];
        },
    };
    return { Landscape: x };
});
CubicVR.RegisterModule("Layout", function () {
    function u(r) {
        this.texture = r.texture ? r.texture : null;
        this.width = r.width ? r.width : 128;
        this.height = r.height ? r.height : 128;
        this.x = r.x ? r.x : 0;
        this.y = r.y ? r.y : 0;
        this.blend = r.blend ? r.blend : !1;
        this.opacity = typeof r.opacity !== "undefined" ? r.opacity : 1;
        this.tint = r.tint ? r.tint : [1, 1, 1];
        this.type = "view";
        this.superView = null;
        this.childViews = [];
        this.panel = null;
    }
    function x(r) {
        this.texture = r.texture ? r.texture : null;
        this.width = r.width ? r.width : 128;
        this.height = r.height ? r.height : 128;
        this.x = r.x ? r.x : 0;
        this.y = r.y ? r.y : 0;
        this.blend = r.blend ? r.blend : !1;
        this.opacity = typeof r.opacity !== "undefined" ? r.opacity : 1;
        this.tint = r.tint ? r.tint : [1, 1, 1];
        this.type = "root";
        this.superView = null;
        this.childViews = [];
        this.setupShader();
        this.panel = null;
        this.makePanel(this);
    }
    u.prototype = {
        addSubview: function (r) {
            this.childViews.push(r);
            r.superView = this;
        },
        makePanel: function (r) {
            return this.superView.makePanel(r);
        },
    };
    x.prototype = {
        resize: function (r, o) {
            this.width = r;
            this.height = o;
        },
        setupShader: function () {
            this.shader = new CubicVR.PostProcessShader({
                shader_vertex:
                    "attribute vec3 aVertex;\nattribute vec2 aTex;\nvarying vec2 vTex;\nuniform vec3 screen;\nuniform vec3 position;\nuniform vec3 size;\nvoid main(void) {\nvTex = aTex;\nvec4 vPos = vec4(aVertex.xyz,1.0);\nvPos.x *= size.x/screen.x;\nvPos.y *= size.y/screen.y;\nvPos.x += (size.x/screen.x);\nvPos.y -= (size.y/screen.y);\nvPos.x += (position.x/screen.x)*2.0 - 1.0;\nvPos.y -= (position.y/screen.y)*2.0 - 1.0;\ngl_Position = vPos;\n}",
                shader_fragment:
                    "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D srcTex;\nuniform vec3 tint;\nvarying vec2 vTex;\nvoid main(void) {\nvec4 color = texture2D(srcTex, vTex)*vec4(tint,1.0);\ngl_FragColor = color;\n}",
                init: function (r) {
                    r.setInt("srcTex", 0);
                    r.addVector("screen");
                    r.addVector("position");
                    r.addVector("tint");
                    r.addVector("size");
                },
            });
        },
        addSubview: function (r) {
            this.childViews.push(r);
            r.superView = this;
        },
        removeSubview: function (r) {
            r = this.childViews.indexOf(r);
            r > -1 && this.childViews.splice(r, 1);
        },
        makePanel: function (r) {
            var o = CubicVR.GLCore.gl,
                q = {};
            q.vbo_points = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0]);
            q.vbo_uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1]);
            q.gl_points = o.createBuffer();
            o.bindBuffer(o.ARRAY_BUFFER, q.gl_points);
            o.bufferData(o.ARRAY_BUFFER, q.vbo_points, o.STATIC_DRAW);
            q.gl_uvs = o.createBuffer();
            o.bindBuffer(o.ARRAY_BUFFER, q.gl_uvs);
            o.bufferData(o.ARRAY_BUFFER, q.vbo_uvs, o.STATIC_DRAW);
            r.panel = q;
        },
        renderPanel: function (r) {
            if (!r.texture) return !1;
            r.texture.use(CubicVR.GLCore.gl.TEXTURE0);
        },
        renderView: function (r) {
            if (r.texture) {
                var o = CubicVR.GLCore.gl,
                    q = r.offsetLeft,
                    m = r.offsetTop;
                q || (q = 0);
                m || (m = 0);
                var e = this.shader.shader;
                e.use();
                e.setVector("screen", [this.width, this.height, 0]);
                e.setVector("position", [r.x + q, r.y + m, 0]);
                e.setVector("size", [r.width, r.height, 0]);
                e.setVector("tint", r.tint);
                r.blend && (o.enable(o.BLEND), o.blendFunc(o.SRC_ALPHA, o.ONE_MINUS_SRC_ALPHA));
                r.texture.use(o.TEXTURE0);
                o.drawArrays(o.TRIANGLES, 0, 6);
                r.blend && (o.disable(o.BLEND), o.blendFunc(o.ONE, o.ZERO));
            }
        },
        render: function () {
            var r = CubicVR.GLCore.gl;
            r.disable(r.DEPTH_TEST);
            this.texture && this.renderView(this);
            var o = [];
            this.offsetTop = this.offsetLeft = 0;
            o.push(this);
            shader = this.shader.shader;
            shader.use();
            r.bindBuffer(r.ELEMENT_ARRAY_BUFFER, null);
            r.bindBuffer(r.ARRAY_BUFFER, this.panel.gl_points);
            r.vertexAttribPointer(shader.uniforms.aVertex, 3, r.FLOAT, !1, 0, 0);
            r.enableVertexAttribArray(shader.uniforms.aVertex);
            r.bindBuffer(r.ARRAY_BUFFER, this.panel.gl_uvs);
            r.vertexAttribPointer(shader.uniforms.aTex, 2, r.FLOAT, !1, 0, 0);
            r.enableVertexAttribArray(shader.uniforms.aTex);
            for (r.bindBuffer(r.ELEMENT_ARRAY_BUFFER, null); o.length; ) {
                var q = o.pop();
                this.renderView(q);
                if (q.childViews.length) for (var m = q.childViews.length - 1; m >= 0; m--) (q.childViews[m].offsetLeft = q.x + q.offsetLeft), (q.childViews[m].offsetTop = q.y + q.offsetTop), o.push(q.childViews[m]);
            }
            r.disableVertexAttribArray(shader.uniforms.aTex);
            r.enable(r.DEPTH_TEST);
        },
    };
    return { Layout: x, View: u };
});
CubicVR.RegisterModule("Light", function (u) {
    function x(e, g) {
        var a = CubicVR.aabb;
        if (e === q) e = o.light.type.POINT;
        if (g === q) g = o.light.method.DYNAMIC;
        typeof e == "object"
            ? ((this.light_type = e.type !== q ? e.type : o.light.type.POINT),
              (this.diffuse = e.diffuse !== q ? e.diffuse : [1, 1, 1]),
              (this.specular = e.specular !== q ? e.specular : [1, 1, 1]),
              (this.intensity = e.intensity !== q ? e.intensity : 1),
              (this.position = e.position !== q ? e.position : [0, 0, 0]),
              (this.direction = e.direction !== q ? e.direction : [0, 0, 0]),
              (this.distance = e.distance !== q ? e.distance : this.light_type === o.light.type.AREA ? 30 : 10),
              (this.cutoff = e.cutoff !== q ? e.cutoff : 60),
              (this.map_res = e.map_res !== q ? e.map_res : this.light_type === o.light.type.AREA ? 2048 : 512),
              (this.map_res = e.mapRes !== q ? e.mapRes : this.map_res),
              (this.method = e.method !== q ? e.method : g),
              (this.areaCam = e.areaCam !== q ? e.areaCam : null),
              (this.areaCeiling = e.areaCeiling !== q ? e.areaCeiling : 40),
              (this.areaFloor = e.areaFloor !== q ? e.areaFloor : -40),
              (this.areaAxis = e.areaAxis !== q ? e.areaAxis : [1, 1, 0]),
              (this.projectorTex = e.projector !== q ? e.projector : null))
            : ((this.light_type = e),
              (this.diffuse = [1, 1, 1]),
              (this.specular = [1, 1, 1]),
              (this.intensity = 1),
              (this.position = [0, 0, 0]),
              (this.direction = [0, 0, 0]),
              (this.distance = this.light_type === o.light.type.AREA ? 30 : 10),
              (this.cutoff = 60),
              (this.map_res = this.light_type === o.light.type.AREA ? 2048 : 512),
              (this.method = g),
              (this.areaCam = null),
              (this.areaCeiling = 40),
              (this.areaFloor = -40),
              (this.areaAxis = [1, 1, 0]),
              (this.projectorTex = null));
        this.setType(this.light_type);
        this.lposition = [0, 0, 0];
        this.dirty = !0;
        this.octree_leaves = [];
        this.octree_common_root = null;
        this.octree_aabb = [
            [0, 0, 0],
            [0, 0, 0],
        ];
        this.ignore_octree = !1;
        this.was_culled = this.culled = this.visible = !0;
        this.aabb = [
            [0, 0, 0],
            [0, 0, 0],
        ];
        a.reset(this.aabb, this.position);
        this.adjust_octree = CubicVR.SceneObject.prototype.adjust_octree;
        this.motion = null;
        this.rotation = [0, 0, 0];
        (this.light_type === o.light.type.SPOT_SHADOW || this.light_type === o.light.type.SPOT_SHADOW_PROJECTOR || (this.light_type === o.light.type.AREA && u.features.lightShadows)) && this.setShadow(this.map_res);
        this.lDir = [0, 0, 0];
        this.lPos = [0, 0, 0];
        this.parent = null;
    }
    var r = u.GLCore,
        o = CubicVR.enums,
        q = u.undef,
        m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    o.light = { type: { NULL: 0, POINT: 1, DIRECTIONAL: 2, SPOT: 3, AREA: 4, DEPTH_PACK: 5, SPOT_SHADOW: 6, SPOT_SHADOW_PROJECTOR: 7, MAX: 8 }, method: { GLOBAL: 0, STATIC: 1, DYNAMIC: 2 } };
    x.prototype = {
        setType: function (e) {
            if (e === o.light.type.AREA && !u.features.lightShadows)
                (this.dummyCam = new CubicVR.Camera()), (this.areaCam = new CubicVR.Camera()), this.updateAreaLight(), (this.areaCam = this.dummyCam = null), (e = o.light.type.DIRECTIONAL);
            else if ((e === o.light.type.SPOT_SHADOW || e === o.light.type.SPOT_SHADOW_PROJECTOR) && !u.features.lightShadows) e = o.light.type.SPOT;
            this.light_type = e;
        },
        setParent: function (e) {
            this.parent = e;
        },
        setMethod: function (e) {
            this.method = e;
        },
        setDiffuse: function (e) {
            this.diffuse = e;
        },
        setSpecular: function (e) {
            this.specular = e;
        },
        setIntensity: function (e) {
            this.intensity = e;
        },
        setPosition: function (e) {
            this.position = e;
        },
        setDistance: function (e) {
            this.distance = e;
        },
        setCutoff: function (e) {
            this.cutoff = e;
        },
        prepare: function (e) {
            var g = CubicVR.mat4,
                a = CubicVR.mat3,
                b = this.light_type;
            if (this.parent)
                if (b === o.light.type.SPOT || b === o.light.type.SPOT_SHADOW || b === o.light.type.SPOT_SHADOW_PROJECTOR)
                    (b = g.inverse_mat3(this.parent.tMatrix)),
                        a.transpose_inline(b),
                        (this.lDir = a.vec3_multiply(this.direction, b)),
                        (this.lDir = a.vec3_multiply(this.lDir, e.nMatrix)),
                        (this.lPos = g.vec3_multiply(this.position, g.multiply(e.mvMatrix, this.parent.tMatrix)));
                else {
                    if (b === o.light.type.POINT) this.lPos = g.vec3_multiply(this.position, g.multiply(e.mvMatrix, this.parent.tMatrix));
                }
            else if (b === o.light.type.DIRECTIONAL) this.lDir = a.vec3_multiply(this.direction, e.nMatrix);
            else if (b === o.light.type.SPOT || b === o.light.type.SPOT_SHADOW || b === o.light.type.SPOT_SHADOW_PROJECTOR) (this.lDir = a.vec3_multiply(this.direction, e.nMatrix)), (this.lPos = g.vec3_multiply(this.position, e.mvMatrix));
            else if (b === o.light.type.POINT) this.lPos = g.vec3_multiply(this.position, e.mvMatrix);
            else if (b === o.light.type.AREA) this.lDir = a.vec3_multiply(this.direction, e.nMatrix);
        },
        control: function (e, g, a) {
            if (e === o.motion.POS) this.position[g] = a;
            else if (e === o.motion.INTENSITY) this.intensity = a;
        },
        getAABB: function () {
            var e = CubicVR.vec3,
                g = CubicVR.aabb,
                a = [
                    [0, 0, 0],
                    [0, 0, 0],
                ];
            g.engulf(a, [this.distance, this.distance, this.distance]);
            g.engulf(a, [-this.distance, -this.distance, -this.distance]);
            a[0] = e.add(a[0], this.position);
            a[1] = e.add(a[1], this.position);
            return (this.aabb = a);
        },
        setDirection: function (e, g, a) {
            var b = CubicVR.vec3;
            if (typeof e === "object") this.setDirection(e[0], e[1], e[2]);
            else return (this.direction = b.normalize([e, g, a])), this;
        },
        lookat: function (e, g, a) {
            var b = CubicVR.vec3;
            if (typeof e === "object") this.lookat(e[0], e[1], e[2]);
            else return (this.direction = b.normalize(b.subtract([e, g, a], this.position))), this;
        },
        setRotation: function (e, g, a) {
            var b = CubicVR.mat4,
                c = CubicVR.vec3;
            if (typeof e === "object") this.setRotation(e[0], e[1], e[2]);
            else {
                var h = new CubicVR.Transform();
                h.rotate([-e, -g, -a]);
                h.pushMatrix();
                this.direction = c.normalize(b.vec3_multiply([1, 0, 0], h.getResult()));
                this.rotation = [e, g, a];
                return this;
            }
        },
        setupShader: function (e, g) {
            var a = r.gl;
            a.uniform3fv(e.lDiff[g], this.diffuse);
            a.uniform3fv(e.lSpec[g], this.specular);
            this.lPos && a.uniform3fv(e.lPos[g], this.lPos);
            this.lDir && a.uniform3fv(e.lDir[g], this.lDir);
            a.uniform1f(e.lInt[g], this.intensity);
            a.uniform1f(e.lDist[g], this.distance);
            (this.light_type === o.light.type.SPOT_SHADOW || this.light_type === o.light.type.SPOT_SHADOW_PROJECTOR || this.light_type === o.light.type.SPOT) && a.uniform1f(e.lCut[g], this.cutoff);
            if (this.light_type === o.light.type.SPOT_SHADOW || this.light_type === o.light.type.SPOT_SHADOW_PROJECTOR || this.light_type === o.light.type.AREA)
                this.light_type === o.light.type.SPOT_SHADOW_PROJECTOR
                    ? (this.shadowMapTex.texture.use(r.gl.TEXTURE0 + g * 2), a.uniform1i(e.lDepthTex[g], g * 2), this.projectorTex.use(r.gl.TEXTURE0 + g * 2 + 1), a.uniform1i(e.lProjTex[g], g * 2 + 1))
                    : (this.shadowMapTex.texture.use(r.gl.TEXTURE0 + g), a.uniform1i(e.lDepthTex[g], g)),
                    a.uniform3fv(e.lDepth[g], [this.dummyCam.nearclip, this.dummyCam.farclip, 1 / this.map_res]),
                    a.uniformMatrix4fv(e.spMatrix[g], !1, this.spMatrix);
        },
        setShadow: function (e) {
            if (u.features.lightShadows)
                (this.map_res = e),
                    (this.shadowMapTex = new CubicVR.RenderBuffer(this.map_res, this.map_res, !0)),
                    this.shadowMapTex.texture.setFilter(o.texture.filter.NEAREST),
                    (this.dummyCam = new CubicVR.Camera(this.map_res, this.map_res, 80, 0.1, this.distance)),
                    (this.dummyCam.calc_nmatrix = !1),
                    this.dummyCam.setTargeted(!0),
                    (this.has_shadow = !0);
        },
        hasShadow: function () {
            return has_shadow;
        },
        setProjector: function (e) {
            this.projectorTex = e;
        },
        hasProjector: function () {
            return this.projectorTex !== null ? !0 : !1;
        },
        shadowBegin: function () {
            var e = r.gl,
                g = CubicVR.mat4,
                a = CubicVR.mat3;
            this.shadowMapTex.use();
            e.viewport(0, 0, this.map_res, this.map_res);
            e.clear(e.DEPTH_BUFFER_BIT | e.COLOR_BUFFER_BIT);
            this.light_type !== o.light.type.AREA ? (this.dummyCam.setClip(0.1, this.distance), this.dummyCam.setFOV(this.cutoff)) : this.dummyCam.calcProjection();
            if (this.parent) {
                var b = g.inverse_mat3(this.parent.tMatrix);
                a.transpose_inline(b);
                a.vec3_multiply(this.direction, b);
                g.vec3_multiply(this.position, this.parent.tMatrix);
                this.dummyCam.lookat(this.position[0], this.position[1], this.position[2], this.position[0] + this.direction[0] * 10, this.position[1] + this.direction[1] * 10, this.position[2] + this.direction[2] * 10, 0, 1, 0);
                g.multiply(this.dummyCam.mvMatrix.slice(0), g.inverse(this.parent.tMatrix), this.dummyCam.mvMatrix);
            } else this.dummyCam.lookat(this.position[0], this.position[1], this.position[2], this.position[0] + this.direction[0] * 10, this.position[1] + this.direction[1] * 10, this.position[2] + this.direction[2] * 10, 0, 1, 0);
            e.cullFace(e.FRONT);
        },
        shadowEnd: function () {
            var e = r.gl;
            e.bindFramebuffer(e.FRAMEBUFFER, null);
            e.cullFace(e.BACK);
            this.setupTexGen();
        },
        setupTexGen: function () {
            var e = CubicVR.mat4;
            this.spMatrix = e.multiply(m, [0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0.5, 0, 0.5, 0.5, 0.5, 1]);
            this.spMatrix = e.multiply(this.spMatrix, this.dummyCam.pMatrix);
            this.spMatrix = e.multiply(this.spMatrix, this.dummyCam.mvMatrix);
        },
        setAreaAxis: function (e) {
            this.areaAxis = e;
        },
        updateAreaLight: function () {
            var e = CubicVR.vec3,
                g = this.areaCeiling - this.areaFloor;
            this.dummyCam.ortho = !0;
            this.dummyCam.setClip(0.01, 1);
            var a = 0,
                a = Math.tan((this.areaCam.fov / 2) * (Math.PI / 180)),
                b = e.subtract(this.areaCam.target, this.areaCam.position);
            b[1] = 0;
            b = e.normalize(b);
            e.normalize(e.cross(b, [0, 1, 0]));
            var c = -Math.atan2(b[2], b[0]),
                a = (this.distance / 2) * Math.abs(a) - this.distance / 2;
            a < this.distance / 3 / 2 && (a = this.distance / 3 / 2);
            b = e.multiply(b, a);
            a = [Math.tan(this.areaAxis[1] * (Math.PI / 180)), 0, Math.tan(this.areaAxis[0] * (Math.PI / 180))];
            c -= Math.atan2(a[0], a[2]);
            this.position = e.add(e.add(this.areaCam.position, b), e.multiply(a, g));
            this.position[1] = this.areaCeiling;
            this.target = e.add(e.add(this.areaCam.position, b), e.multiply(a, -g));
            this.target[1] = this.areaFloor;
            this.direction = e.normalize(e.subtract(this.target, this.position));
            this.dummyCam.rotation[2] = c * (180 / Math.PI);
            e = this.dummyCam.nearclip;
            g = this.dummyCam.farclip * Math.abs(this.direction[1]) * g;
            e = this.orthoBounds(this.position, this.distance, this.distance, this.dummyCam.pMatrix, this.dummyCam.mvMatrix, this.dummyCam.nearclip);
            e = this.orthoBounds(this.position, this.distance, this.distance, this.dummyCam.pMatrix, this.dummyCam.mvMatrix, this.dummyCam.farclip);
            e[1][1] > this.areaFloor && ((e = e[1][1] - this.areaFloor), (g += e / Math.abs(this.direction[1])));
            this.dummyCam.nearclip = 0.01;
            this.dummyCam.farclip = g;
            this.dummyCam.setOrtho(-this.distance / 2, this.distance / 2, -this.distance / 2, this.distance / 2);
        },
        orthoBounds: function (e, g, a, b, c, h) {
            var b = CubicVR.vec3,
                d = b.normalize([c[0], c[4], c[8]]),
                n = b.normalize([c[1], c[5], c[9]]),
                c = b.normalize(b.cross(n, d)),
                t;
            t = a / 2;
            a = [];
            g = b.multiply(d, g / 2);
            d = b.multiply(n, t);
            h = b.multiply(c, h);
            a[0] = b.add(b.subtract(e, g), b.add(d, h));
            a[1] = b.add(b.add(e, g), b.add(d, h));
            a[2] = b.subtract(b.subtract(e, g), b.add(d, h));
            a[3] = b.subtract(b.add(e, g), b.add(d, h));
            aabb1 = a[0];
            aabb2 = a[0];
            for (e = 1; e < 4; e++)
                aabb1[0] > a[e][0] && (aabb1[0] = a[e][0]),
                    aabb1[1] > a[e][1] && (aabb1[1] = a[e][1]),
                    aabb1[2] > a[e][2] && (aabb1[2] = a[e][2]),
                    aabb2[0] < a[e][0] && (aabb2[0] = a[e][0]),
                    aabb2[1] < a[e][1] && (aabb2[1] = a[e][1]),
                    aabb2[2] < a[e][2] && (aabb2[2] = a[e][2]);
            return [aabb1, aabb2];
        },
    };
    return { Light: x };
});
CubicVR.RegisterModule("MainLoop", function (u) {
    function x() {
        this.paused_state = this.offset = this.paused_time = this.last_update = this.end_time = this.start_time = this.system_milliseconds = this.time_elapsed = 0;
    }
    function r() {
        CubicVR.GLCore.mainloop !== null && (window.requestAnimationFrame && window.requestAnimationFrame(r), CubicVR.GLCore.mainloop.interval());
    }
    function o(g, a, b) {
        if (window.requestAnimationFrame === m) window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || null;
        if (CubicVR.GLCore.mainloop !== null) !window.requestAnimationFrame && CubicVR.GLCore.mainloop && clearInterval(CubicVR.GLCore.mainloop.interval), (CubicVR.GLCore.mainloop = null);
        if (g === null) CubicVR.GLCore.mainloop = null;
        else {
            this.renderList = [];
            var c = (this.renderStack = [{ scenes: [], update: function () {}, start: function () {}, stop: function () {} }]),
                h = new x();
            h.start();
            this.timer = h;
            this.func = g;
            this.doclear = a !== m ? a : !0;
            CubicVR.GLCore.mainloop = this;
            if (e.resizeList.length && !CubicVR.GLCore.resize_active)
                window.addEventListener(
                    "resize",
                    function () {
                        CubicVR.GLCore.onResize();
                    },
                    !1
                ),
                    (CubicVR.GLCore.resize_active = !0);
            a = (function () {
                return function () {
                    var a = CubicVR.GLCore.gl;
                    h.update();
                    CubicVR.GLCore.mainloop.doclear && a.clear(a.COLOR_BUFFER_BIT | a.DEPTH_BUFFER_BIT);
                    g(h, CubicVR.GLCore.gl);
                    var b = c[c.length - 1],
                        t = b.scenes;
                    b.update && b.update(h, a);
                    if (t) {
                        a = 0;
                        for (b = t.length; a < b; ++a) {
                            var s = t[a];
                            s.paused || (s.update && s.update(h, CubicVR.GLCore.gl), s.render());
                        }
                    }
                };
            })();
            b ? (this.loopFunc = a) : window.requestAnimationFrame ? ((this.interval = a), window.requestAnimationFrame(r)) : (this.interval = setInterval(a, 20));
        }
    }
    function q(e, a, b) {
        this.canvas = e;
        this.camera = a;
        this.mpos = [0, 0];
        this.mdown = !1;
        var c = this;
        this.mEvents = {};
        this.keyState = [];
        this.onMouseDown = (function () {
            return function (a) {
                c.mdown = !0;
                c.mpos = [a.pageX - a.target.offsetLeft, a.pageY - a.target.offsetTop];
                c.mEvents.mouseDown && c.mEvents.mouseDown(c, c.mpos, c.keyState);
            };
        })();
        this.onMouseUp = (function () {
            return function (a) {
                c.mdown = !1;
                c.mpos = [a.pageX - a.target.offsetLeft, a.pageY - a.target.offsetTop];
                c.mEvents.mouseUp && c.mEvents.mouseUp(c, c.mpos, c.keyState);
            };
        })();
        this.onMouseMove = (function () {
            return function (a) {
                var d = [],
                    a = [a.pageX - a.target.offsetLeft, a.pageY - a.target.offsetTop];
                d[0] = a[0] - c.mpos[0];
                d[1] = a[1] - c.mpos[1];
                c.mpos = a;
                c.mEvents.mouseMove && c.mEvents.mouseMove(c, c.mpos, d, c.keyState);
            };
        })();
        this.onMouseWheel = (function () {
            return function (a) {
                a = a.wheelDelta ? a.wheelDelta : -a.detail * 100;
                c.mEvents.mouseWheel && c.mEvents.mouseWheel(c, c.mpos, a, c.keyState);
            };
        })();
        this.onKeyDown = (function () {
            return function () {};
        })();
        this.onKeyUp = (function () {
            return function () {};
        })();
        this.eventDefaults = {
            mouseMove: function (a, d, b) {
                a.mdown && a.orbitView(b);
            },
            mouseWheel: function (a, d, b) {
                a.zoomView(b);
            },
            mouseDown: null,
            mouseUp: null,
            keyDown: null,
            keyUp: null,
        };
        b !== !1 && this.setEvents(b === m ? this.eventDefaults : b);
        this.bind();
    }
    var m = u.undef,
        e = u.GLCore;
    x.prototype = {
        start: function () {
            this.update();
            this.num_updates = 0;
            this.last_update = this.start_time = this.system_milliseconds;
            this.lock_state = this.paused_state = !1;
            this.offset = this.paused_time = this.lock_rate = 0;
        },
        stop: function () {
            this.end_time = this.system_milliseconds;
        },
        reset: function () {
            this.start();
        },
        lockFramerate: function () {
            this.lock_rate = 1 / this.f_rate;
            this.lock_state = !0;
        },
        unlock: function () {
            var e = this.system_milliseconds;
            this.lock_state = !1;
            this.update();
            this.last_update = this.system_milliseconds - this.lock_rate;
            this.offset += e - this.system_milliseconds;
            this.lock_rate = 0;
        },
        locked: function () {
            return this.lock_state;
        },
        update: function () {
            this.num_updates++;
            this.last_update = this.system_milliseconds;
            this.lock_state ? (this.system_milliseconds += (lock_rate * 1e3) | 0) : (this.system_milliseconds = Date.now());
            this.paused_state && (this.paused_time += this.system_milliseconds - this.last_update);
            this.time_elapsed = this.system_milliseconds - this.start_time - this.paused_time + this.offset;
        },
        getMilliseconds: function () {
            return this.time_elapsed;
        },
        getSeconds: function () {
            return this.getMilliseconds() / 1e3;
        },
        setMilliseconds: function (e) {
            this.offset -= this.system_milliseconds - this.start_time - this.paused_time + this.offset - e;
        },
        setSeconds: function (e) {
            this.setMilliseconds((e * 1e3) | 0);
        },
        getLastUpdateSeconds: function () {
            return this.getLastUpdateMilliseconds() / 1e3;
        },
        getLastUpdateMilliseconds: function () {
            return this.system_milliseconds - this.last_update;
        },
        getTotalMilliseconds: function () {
            return this.system_milliseconds - this.start_time;
        },
        getTotalSeconds: function () {
            return this.getTotalMilliseconds() / 1e3;
        },
        getNumUpdates: function () {
            return this.num_updates;
        },
        setPaused: function (e) {
            this.paused_state = e;
        },
        getPaused: function () {
            return this.paused_state;
        },
    };
    o.prototype = {
        setPaused: function (e) {
            this.timer.setPaused(e);
        },
        getPaused: function () {
            return this.timer.getPaused();
        },
        setTimerSeconds: function (e) {
            this.timer.setSeconds(e);
        },
        getTimerSeconds: function () {
            return this.timer.getSeconds();
        },
        resetTimer: function () {
            this.timer.reset();
        },
        addScene: function (e) {
            this.renderStack[this.renderStack.length - 1].scenes.push(e);
            return e;
        },
        pushSceneGroup: function (e) {
            e.scenes = e.scenes || [];
            this.renderStack.push(e);
            for (var a = 0; a < e.scenes.length; ++a) e.scenes[a].enable();
            e.start && e.start();
        },
        popSceneGroup: function () {
            for (var e = this.renderStack[this.renderStack.length - 1], a = 0; a < e.scenes.length; ++a) e.scenes[a].disable();
            this.renderStack.length > 1 && this.renderStack.pop();
            e.stop && e.stop();
        },
        getScene: function (e) {
            for (var a = renderStack[renderStack.length - 1], b, c = 0, h = a.scenes.length; c < h; ++c)
                if (a.scenes[c].scene.name === e) {
                    b = a.scenes[c];
                    break;
                }
            return b;
        },
        resumeScene: function (e) {
            typeof e === "string" && (e = this.getScene(e));
            e.enable();
            e.paused = !1;
        },
        pauseScene: function (e) {
            typeof e === "string" && (e = this.getScene(e));
            e.paused = !0;
            e.disable();
        },
        removeScene: function (e) {
            var a = renderStack[renderStack.length - 1];
            typeof e === "string" && (e = this.getScene(e));
            var b = a.scenes.indexOf(e);
            b > -1 && a.scenes.splice(b, 1);
            return e;
        },
        runOnce: function () {
            this.loopFunc();
        },
    };
    q.prototype = {
        setEvents: function (e) {
            this.mEvents = {};
            for (var a in e) this.bindEvent(a, e[a]);
        },
        orbitView: function (e) {
            var a = CubicVR.vec3,
                b = a.subtract(this.camera.target, this.camera.position),
                b = a.length(b);
            this.camera.position = a.moveViewRelative(this.camera.position, this.camera.target, (-b * e[0]) / 300, 0);
            this.camera.position[1] += (b * e[1]) / 300;
            this.camera.position = a.add(this.camera.target, a.multiply(a.normalize(a.subtract(this.camera.position, this.camera.target)), b));
        },
        panView: function (e, a) {
            var b = CubicVR.vec3;
            a || (a = !1);
            var c = b.subtract(this.camera.target, this.camera.position),
                c = b.length(c),
                h = this.camera.position;
            a
                ? (this.camera.position = b.moveViewRelative(this.camera.position, this.camera.target, (-c * e[0]) / 300, (-c * e[1]) / 300))
                : ((this.camera.position = b.moveViewRelative(this.camera.position, this.camera.target, (-c * e[0]) / 300, 0)), (this.camera.position[1] += (c * e[1]) / 300));
            c = b.subtract(this.camera.position, h);
            this.camera.target = b.add(this.camera.target, c);
        },
        zoomView: function (e, a, b) {
            var c = CubicVR.vec3,
                h = c.subtract(this.camera.target, this.camera.position),
                h = c.length(h);
            h -= e / 1e3;
            a || (a = 0.1);
            b || (b = 1e3);
            h < a && (h = a);
            h > b && (h = b);
            this.camera.position = c.add(this.camera.target, c.multiply(c.normalize(c.subtract(this.camera.position, this.camera.target)), h));
        },
        bindEvent: function (e, a) {
            this.mEvents[e] = a === m ? this.eventDefaults[e] : a;
        },
        unbindEvent: function (e) {
            this.bindEvent(e, null);
        },
        bind: function () {
            this.canvas.addEventListener("mousemove", this.onMouseMove, !1);
            this.canvas.addEventListener("mousedown", this.onMouseDown, !1);
            this.canvas.addEventListener("mouseup", this.onMouseUp, !1);
            this.canvas.addEventListener("mousewheel", this.onMouseWheel, !1);
            this.canvas.addEventListener("DOMMouseScroll", this.onMouseWheel, !1);
            this.canvas.addEventListener("keydown", this.onKeyDown, !1);
            this.canvas.addEventListener("keyup", this.onKeyUp, !1);
        },
        unbind: function () {
            this.canvas.removeEventListener("mousemove", this.onMouseMove, !1);
            this.canvas.removeEventListener("mousedown", this.onMouseDown, !1);
            this.canvas.removeEventListener("mouseup", this.onMouseUp, !1);
            this.canvas.removeEventListener("mousewheel", this.onMouseWheel, !1);
            this.canvas.removeEventListener("DOMMouseScroll", this.onMouseWheel, !1);
            this.canvas.removeEventListener("keydown", this.onKeyDown, !1);
            this.canvas.removeEventListener("keyup", this.onKeyUp, !1);
        },
        setCamera: function (e) {
            this.camera = e;
        },
        getMousePosition: function () {
            return this.mpos;
        },
    };
    return {
        Timer: x,
        MainLoop: o,
        MouseViewController: q,
        setMainLoop: function (e) {
            CubicVR.GLCore.mainloop = e;
        },
    };
});
CubicVR.RegisterModule("Texture", function (u) {
    function x(a) {
        var d = CubicVR.GLCore.gl;
        if (a.nodeName === "CANVAS" || a.nodeName === "IMG") this.canvasSource = a;
        else {
            this.canvasSource = document.createElement("CANVAS");
            if (a.width === void 0 || a.height === void 0) throw Error("Width and height must be specified for generating a new CanvasTexture.");
            this.canvasSource.width = a.width;
            this.canvasSource.height = a.height;
            this.canvasContext = this.canvasSource.getContext("2d");
        }
        var b = this.canvasSource,
            c = b.width,
            b = b.height,
            e = !0;
        if (c === 1 || b === 1) e = !1;
        else {
            if (c !== 1) for (; c % 2 === 0; ) c /= 2;
            if (b !== 1) for (; b % 2 === 0; ) b /= 2;
            c > 1 && (e = !1);
            b > 1 && (e = !1);
        }
        this.updateFunction = a.update;
        this.texture = new CubicVR.Texture();
        this.setFilter = this.texture.setFilter;
        this.clear = this.texture.clear;
        this.use = this.texture.use;
        this.tex_id = this.texture.tex_id;
        this.filterType = this.texture.filterType;
        e
            ? (this.setFilter(g.texture.filter.LINEAR_MIP), d.texParameteri(d.TEXTURE_2D, d.TEXTURE_WRAP_S, d.REPEAT), d.texParameteri(d.TEXTURE_2D, d.TEXTURE_WRAP_T, d.REPEAT))
            : (this.setFilter(g.texture.filter.LINEAR), d.texParameteri(d.TEXTURE_2D, d.TEXTURE_WRAP_S, d.CLAMP_TO_EDGE), d.texParameteri(d.TEXTURE_2D, d.TEXTURE_WRAP_T, d.CLAMP_TO_EDGE));
        a.nodeName === "IMG" && this.update();
    }
    function r(a, d, b) {
        var c = CubicVR.GLCore.gl;
        this.texture = new CubicVR.Texture();
        this.canvas = document.createElement("CANVAS");
        this.canvas.width = d;
        this.canvas.height = b;
        this.pjs = new Processing(this.canvas, CubicVR.util.getURL(a));
        this.pjs.noLoop();
        this.pjs.redraw();
        a = this.canvas.width;
        d = this.canvas.height;
        b = !0;
        if (a === 1 || d === 1) b = !1;
        else {
            if (a !== 1) for (; a % 2 === 0; ) a /= 2;
            if (d !== 1) for (; d % 2 === 0; ) d /= 2;
            a > 1 && (b = !1);
            d > 1 && (b = !1);
        }
        this.setFilter = this.texture.setFilter;
        this.clear = this.texture.clear;
        this.use = this.texture.use;
        this.tex_id = this.texture.tex_id;
        this.filterType = this.texture.filterType;
        b ? this.setFilter(g.texture.filter.LINEAR_MIP) : (this.setFilter(g.texture.filter.LINEAR), c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE), c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE));
    }
    function o(a, d, b) {
        var c = e.gl;
        this.width = d;
        this.height = b;
        this.srcTex = a;
        this.outTex = new CubicVR.RenderBuffer(d, b);
        var a = d,
            s = b;
        if (!(a === 1 || s === 1)) {
            if (a !== 1) for (; a % 2 === 0; ) a /= 2;
            if (s !== 1) for (; s % 2 === 0; ) s /= 2;
        }
        a = [1 / d, 1 / b, 0];
        this.outputBuffer = new CubicVR.RenderBuffer(d, b, !1);
        this.fsQuad = CubicVR.fsQuad.make(d, b);
        shaderNMap = new CubicVR.Shader(
            "attribute vec3 aVertex;\nattribute vec2 aTex;\nvarying vec2 vTex;\nvoid main(void)\n{\n  vTex = aTex;\n  vec4 vPos = vec4(aVertex.xyz,1.0);\n  gl_Position = vPos;\n}",
            "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D srcTex;\nvarying vec2 vTex;\nuniform vec3 texel;\nvoid main(void)\n{\n vec3 color;\n color.r = (texture2D(srcTex,vTex + vec2(texel.x,0)).r-texture2D(srcTex,vTex + vec2(-texel.x,0)).r)/2.0 + 0.5;\n color.g = (texture2D(srcTex,vTex + vec2(0,-texel.y)).r-texture2D(srcTex,vTex + vec2(0,texel.y)).r)/2.0 + 0.5;\n color.b = 1.0;\n gl_FragColor.rgb = color;\n gl_FragColor.a = 1.0;\n}"
        );
        shaderNMap.use();
        shaderNMap.addUVArray("aTex");
        shaderNMap.addVertexArray("aVertex");
        shaderNMap.addInt("srcTex", 0);
        shaderNMap.addVector("texel");
        shaderNMap.setVector("texel", a);
        this.shaderNorm = shaderNMap;
        this.setFilter = this.outputBuffer.texture.setFilter;
        this.clear = this.outputBuffer.texture.clear;
        this.use = this.outputBuffer.texture.use;
        this.tex_id = this.outputBuffer.texture.tex_id;
        this.filterType = this.outputBuffer.texture.filterType;
        this.outTex.use(c.TEXTURE0);
        this.setFilter(g.texture.filter.LINEAR);
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.REPEAT);
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.REPEAT);
    }
    function q(a, d, b) {
        var c = e.gl;
        this.width = a;
        this.height = d;
        this.outTex = new CubicVR.RenderBuffer(a, d, b);
        this.texture = this.outTex.texture;
        var s = a,
            m = d,
            C = !0;
        if (s === 1 || m === 1) C = !1;
        else {
            if (s !== 1) for (; s % 2 === 0; ) s /= 2;
            if (m !== 1) for (; m % 2 === 0; ) m /= 2;
            s > 1 && (C = !1);
            m > 1 && (C = !1);
        }
        this.setFilter = this.outTex.texture.setFilter;
        this.clear = this.outTex.texture.clear;
        this.use = this.outTex.texture.use;
        this.tex_id = this.outTex.texture.tex_id;
        this.filterType = this.outTex.texture.filterType;
        this.texture.use(c.TEXTURE0);
        C
            ? (this.setFilter(g.texture.filter.LINEAR), c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.REPEAT), c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.REPEAT))
            : (this.setFilter(g.texture.filter.LINEAR), c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE), c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE));
        this.dims = [a, d];
        this.depth = b ? !0 : !1;
    }
    function m(a, d) {
        this.scene = a;
        this.renderTex = new q(d ? d.width : a.camera.width, d ? d.height : a.camera.height, !0);
        this.setFilter = this.renderTex.texture.setFilter;
        this.clear = this.renderTex.texture.clear;
        this.use = this.renderTex.texture.use;
        this.tex_id = this.renderTex.texture.tex_id;
        this.filterType = this.renderTex.texture.filterType;
    }
    var e = u.GLCore,
        g = CubicVR.enums,
        a = u.undef;
    g.texture = { map: { COLOR: 0, ENVSPHERE: 1, NORMAL: 2, BUMP: 3, REFLECT: 4, SPECULAR: 5, AMBIENT: 6, ALPHA: 7, MAX: 8 }, filter: { LINEAR: 0, LINEAR_MIP: 1, NEAREST: 2, NEAREST_MIP: 3 } };
    var b = function (a, d) {
        this.img_path = a;
        this.filter_type = d;
    };
    b.prototype = {
        getTexture: function (a, d) {
            return new c(this.img_path, this.filter_type, a, d);
        },
    };
    var c = function (b, d, n, c, s) {
        var m = e.gl;
        this.tex_id = u.Textures.length;
        this.filterType = -1;
        this.onready = s;
        this.loaded = !1;
        u.Textures[this.tex_id] = m.createTexture();
        u.Textures_obj[this.tex_id] = this;
        if (b) typeof b === "string" ? (u.Images[this.tex_id] = new Image()) : typeof b === "object" && b.nodeName === "IMG" && (u.Images[this.tex_id] = b), (u.Textures_ref[b] = this.tex_id);
        m.bindTexture(m.TEXTURE_2D, u.Textures[this.tex_id]);
        m.texParameteri(m.TEXTURE_2D, m.TEXTURE_MAG_FILTER, m.LINEAR);
        m.texParameteri(m.TEXTURE_2D, m.TEXTURE_MIN_FILTER, m.LINEAR);
        if (b) {
            var C = this.tex_id,
                q = d !== a ? d : e.default_filter,
                v = this;
            u.Images[this.tex_id].onload = function () {
                m.bindTexture(m.TEXTURE_2D, u.Textures[C]);
                m.pixelStorei(m.UNPACK_FLIP_Y_WEBGL, !0);
                m.pixelStorei(m.UNPACK_COLORSPACE_CONVERSION_WEBGL, m.NONE);
                var a = u.Images[C];
                m.texImage2D(m.TEXTURE_2D, 0, m.RGBA, m.RGBA, m.UNSIGNED_BYTE, a);
                var d = a.width,
                    a = a.height,
                    b = !0;
                if (d === 1 || a === 1) b = !1;
                else {
                    if (d !== 1) for (; d % 2 === 0; ) d /= 2;
                    if (a !== 1) for (; a % 2 === 0; ) a /= 2;
                    d > 1 && (b = !1);
                    a > 1 && (b = !1);
                }
                b || (m.texParameteri(m.TEXTURE_2D, m.TEXTURE_WRAP_S, m.CLAMP_TO_EDGE), m.texParameteri(m.TEXTURE_2D, m.TEXTURE_WRAP_T, m.CLAMP_TO_EDGE));
                if (u.Textures_obj[C].filterType === -1) {
                    if (!b && q === g.texture.filter.LINEAR_MIP) q = g.texture.filter.LINEAR;
                    u.Textures_obj[C].filterType === -1 && u.Textures_obj[C].setFilter(q);
                } else u.Textures_obj[C].setFilter(u.Textures_obj[C].filterType);
                m.bindTexture(m.TEXTURE_2D, null);
                if (v.onready) v.onready();
                v.loaded = !0;
            };
            if (n) (u.Images[this.tex_id].deferredSrc = b), n.addImage(c, b, u.Images[this.tex_id]);
            else if (typeof b === "string") u.Images[this.tex_id].src = b;
        }
        this.active_unit = -1;
    };
    c.prototype = {
        setFilter: function (a) {
            var d = CubicVR.GLCore.gl;
            d.bindTexture(d.TEXTURE_2D, u.Textures[this.tex_id]);
            a === g.texture.filter.LINEAR
                ? (d.texParameteri(d.TEXTURE_2D, d.TEXTURE_MAG_FILTER, d.LINEAR), d.texParameteri(d.TEXTURE_2D, d.TEXTURE_MIN_FILTER, d.LINEAR))
                : a === g.texture.filter.LINEAR_MIP
                ? (d.texParameteri(d.TEXTURE_2D, d.TEXTURE_MAG_FILTER, d.LINEAR), d.texParameteri(d.TEXTURE_2D, d.TEXTURE_MIN_FILTER, d.LINEAR_MIPMAP_NEAREST), d.generateMipmap(d.TEXTURE_2D))
                : a === g.texture.filter.NEAREST
                ? (d.texParameteri(d.TEXTURE_2D, d.TEXTURE_MAG_FILTER, d.NEAREST), d.texParameteri(d.TEXTURE_2D, d.TEXTURE_MIN_FILTER, d.NEAREST))
                : a === g.texture.filter.NEAREST_MIP && (d.texParameteri(d.TEXTURE_2D, d.TEXTURE_MAG_FILTER, d.NEAREST), d.texParameteri(d.TEXTURE_2D, d.TEXTURE_MIN_FILTER, d.NEAREST_MIPMAP_LINEAR), d.generateMipmap(d.TEXTURE_2D));
            this.filterType = a;
        },
        use: function (a) {
            e.gl.activeTexture(a);
            e.gl.bindTexture(e.gl.TEXTURE_2D, u.Textures[this.tex_id]);
            this.active_unit = a;
        },
        clear: function () {
            if (this.active_unit !== -1) e.gl.activeTexture(this.active_unit), e.gl.bindTexture(e.gl.TEXTURE_2D, null), (this.active_unit = -1);
        },
    };
    x.prototype = {
        update: function () {
            this.updateFunction && this.updateFunction(this.canvasSource, this.canvasContext);
            var a = CubicVR.GLCore.gl;
            a.bindTexture(a.TEXTURE_2D, u.Textures[this.texture.tex_id]);
            a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL, !0);
            a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, this.canvasSource);
            this.filterType === g.texture.filter.LINEAR_MIP && a.generateMipmap(a.TEXTURE_2D);
            a.bindTexture(a.TEXTURE_2D, null);
        },
    };
    r.prototype = {
        update: function () {
            var a = CubicVR.GLCore.gl;
            this.pjs.redraw();
            a.bindTexture(a.TEXTURE_2D, u.Textures[this.texture.tex_id]);
            a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL, !0);
            a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, this.canvas);
            this.filterType === g.texture.filter.LINEAR_MIP && a.generateMipmap(a.TEXTURE_2D);
            a.bindTexture(a.TEXTURE_2D, null);
        },
    };
    o.prototype = {
        update: function () {
            var a = e.gl,
                d = a.getParameter(a.VIEWPORT);
            this.outputBuffer.use();
            a.viewport(0, 0, this.width, this.height);
            a.clearColor(0, 0, 0, 1);
            a.clear(a.COLOR_BUFFER_BIT);
            this.srcTex.use(a.TEXTURE0);
            CubicVR.fsQuad.render(this.shaderNorm, this.fsQuad);
            a.bindFramebuffer(a.FRAMEBUFFER, null);
            a.viewport(d[0], d[1], d[2], d[3]);
        },
    };
    q.prototype = {
        begin: function () {
            var a = e.gl;
            this.dims = a.getParameter(a.VIEWPORT);
            this.outTex.use();
            a.viewport(0, 0, this.width, this.height);
            this.depth ? a.clear(a.COLOR_BUFFER_BIT | a.DEPTH_BUFFER_BIT) : a.clear(a.COLOR_BUFFER_BIT);
        },
        end: function () {
            var a = e.gl;
            a.bindFramebuffer(a.FRAMEBUFFER, null);
            a.viewport(this.dims[0], this.dims[1], this.dims[2], this.dims[3]);
        },
    };
    m.prototype = {
        update: function () {
            this.renderTex.begin();
            this.scene.updateShadows();
            this.scene.render();
            this.renderTex.end();
        },
    };
    return {
        Texture: c,
        DeferredLoadTexture: b,
        CanvasTexture: x,
        TextTexture: function (b, d) {
            var n = (d && d.color) || "#fff",
                c = d && d.bgcolor,
                e = (d && d.font) || "18pt Arial",
                g = (d && d.align) || "start",
                m = (d && d.y) || 0,
                q = (d && d.width) || a,
                v = (d && d.height) || a,
                o,
                r = document.createElement("CANVAS"),
                A = r.getContext("2d"),
                w = 0,
                w = typeof b === "string" ? 1 : b.length;
            A.font = e;
            var y = (d && d.lineHeight) || A.measureText("OO").width,
                u;
            if (w === 1) u = A.measureText(b).width;
            else
                for (o = u = 0; o < w; ++o) {
                    var B = A.measureText(b[o]).width;
                    B > u && (u = B);
                }
            r.width = q || u;
            r.height = v || y * w;
            if (c) (A.fillStyle = c), A.fillRect(0, 0, r.width, r.height);
            A.fillStyle = n;
            A.font = e;
            A.textAlign = g;
            A.textBaseline = "top";
            if (w === 1) (n = (d && d.x) || g === "center" ? r.width / 2 : g === "right" ? r.width : 0), A.fillText(b, n, m);
            else for (o = 0; o < w; ++o) (n = (d && d.x) || g === "center" ? r.width / 2 : g === "right" ? r.width : 0), A.fillText(b[o], n, m + o * y);
            A.fill();
            this.use = x.prototype.use;
            this.clear = x.prototype.clear;
            this.update = x.prototype.update;
            x.apply(this, [r]);
            this.update();
            this.canvasSource = null;
        },
        PJSTexture: r,
        NormalMapGen: o,
        RenderTexture: q,
        SceneRenderTexture: m,
    };
});
CubicVR.RegisterModule("Material", function (u) {
    function x(e) {
        this.initialized = !1;
        this.textures = [];
        this.shader = [];
        this.customShader = null;
        typeof e === "object"
            ? ((this.diffuse = e.diffuse === r ? [1, 1, 1] : e.diffuse),
              (this.specular = e.specular === r ? [0.1, 0.1, 0.1] : e.specular),
              (this.color = e.color === r ? [1, 1, 1] : e.color),
              (this.ambient = e.ambient === r ? [0, 0, 0] : e.ambient),
              (this.opacity = e.opacity === r ? 1 : e.opacity),
              (this.shininess = e.shininess === r ? 1 : e.shininess),
              (this.max_smooth = e.max_smooth === r ? 60 : e.max_smooth),
              (this.env_amount = e.env_amount === r ? 0.75 : e.env_amount),
              (this.morph = e.morph === r ? !1 : e.morph),
              (this.color_map = e.colorMap === r ? !1 : e.colorMap),
              (this.name = e.name === r ? r : e.name),
              typeof e.textures === "object" &&
                  (e.textures.color !== r && this.setTexture(e.textures.color, q.texture.map.COLOR),
                  e.textures.envsphere !== r && this.setTexture(e.textures.envsphere, q.texture.map.ENVSPHERE),
                  e.textures.normal !== r && this.setTexture(e.textures.normal, q.texture.map.NORMAL),
                  e.textures.bump !== r && this.setTexture(e.textures.bump, q.texture.map.BUMP),
                  e.textures.reflect !== r && this.setTexture(e.textures.reflect, q.texture.map.REFLECT),
                  e.textures.specular !== r && this.setTexture(e.textures.specular, q.texture.map.SPECULAR),
                  e.textures.ambient !== r && this.setTexture(e.textures.ambient, q.texture.map.AMBIENT),
                  e.textures.alpha !== r && this.setTexture(e.textures.alpha, q.texture.map.ALPHA)))
            : ((this.diffuse = [1, 1, 1]),
              (this.specular = [0.1, 0.1, 0.1]),
              (this.color = [1, 1, 1]),
              (this.ambient = [0, 0, 0]),
              (this.shininess = this.opacity = 1),
              (this.max_smooth = 60),
              (this.name = e),
              (this.color_map = this.morph = !1));
    }
    var r = u.undef,
        o = u.GLCore,
        q = CubicVR.enums,
        m = [q.texture.map.REFLECT, q.texture.map.SPECULAR, q.texture.map.NORMAL, q.texture.map.BUMP];
    x.prototype = {
        clone: function () {
            var e = new CubicVR.Material({
                    diffuse: this.diffuse,
                    specular: this.specular,
                    color: this.color,
                    ambient: this.ambient,
                    opacity: this.opacity,
                    shininess: this.shininess,
                    max_smooth: this.max_smooth,
                    env_amount: this.env_amount,
                    morph: this.morph,
                    colorMap: this.color_map,
                    name: this.name,
                }),
                g;
            for (g in this.textures) e.setTexture(this.textures[g], g);
            return e;
        },
        setTexture: function (e, g) {
            g === r && (g = 0);
            if (u.features.texturePerPixel || m.indexOf(g) === -1) this.textures[g] = e;
        },
        calcShaderMask: function () {
            var e = 0;
            e += typeof this.textures[q.texture.map.COLOR] === "object" ? q.shader.map.COLOR : 0;
            e += typeof this.textures[q.texture.map.SPECULAR] === "object" ? q.shader.map.SPECULAR : 0;
            e += typeof this.textures[q.texture.map.NORMAL] === "object" ? q.shader.map.NORMAL : 0;
            e += typeof this.textures[q.texture.map.BUMP] === "object" ? q.shader.map.BUMP : 0;
            e += typeof this.textures[q.texture.map.REFLECT] === "object" ? q.shader.map.REFLECT : 0;
            e += typeof this.textures[q.texture.map.ENVSPHERE] === "object" ? q.shader.map.ENVSPHERE : 0;
            e += typeof this.textures[q.texture.map.AMBIENT] === "object" ? q.shader.map.AMBIENT : 0;
            e += typeof this.textures[q.texture.map.ALPHA] === "object" ? q.shader.map.ALPHA : 0;
            e += this.opacity !== 1 ? q.shader.map.ALPHA : 0;
            return e;
        },
        getShaderHeader: function (e, g) {
            return (
                (g !== r ? "#define loopCount " + g + "\n" : "") +
                "#define hasColorMap " +
                (typeof this.textures[q.texture.map.COLOR] === "object" ? 1 : 0) +
                "\n#define hasSpecularMap " +
                (typeof this.textures[q.texture.map.SPECULAR] === "object" ? 1 : 0) +
                "\n#define hasNormalMap " +
                (typeof this.textures[q.texture.map.NORMAL] === "object" ? 1 : 0) +
                "\n#define hasBumpMap " +
                (typeof this.textures[q.texture.map.BUMP] === "object" ? 1 : 0) +
                "\n#define hasReflectMap " +
                (typeof this.textures[q.texture.map.REFLECT] === "object" ? 1 : 0) +
                "\n#define hasEnvSphereMap " +
                (typeof this.textures[q.texture.map.ENVSPHERE] === "object" ? 1 : 0) +
                "\n#define hasAmbientMap " +
                (typeof this.textures[q.texture.map.AMBIENT] === "object" ? 1 : 0) +
                "\n#define hasAlphaMap " +
                (typeof this.textures[q.texture.map.ALPHA] === "object" ? 1 : 0) +
                "\n#define hasAlpha " +
                (this.opacity !== 1 ? 1 : 0) +
                "\n#define lightPoint " +
                (e === q.light.type.POINT ? 1 : 0) +
                "\n#define lightDirectional " +
                (e === q.light.type.DIRECTIONAL ? 1 : 0) +
                "\n#define lightSpot " +
                (e === q.light.type.SPOT || e === q.light.type.SPOT_SHADOW || e === q.light.type.SPOT_SHADOW_PROJECTOR ? 1 : 0) +
                "\n#define hasShadow " +
                (e === q.light.type.SPOT_SHADOW || e === q.light.type.SPOT_SHADOW_PROJECTOR || e === q.light.type.AREA ? 1 : 0) +
                "\n#define hasProjector " +
                (e === q.light.type.SPOT_SHADOW_PROJECTOR ? 1 : 0) +
                "\n#define softShadow " +
                (o.soft_shadow ? 1 : 0) +
                "\n#define lightArea " +
                (e === q.light.type.AREA ? 1 : 0) +
                "\n#define depthPack " +
                (e === q.light.type.DEPTH_PACK ? 1 : 0) +
                "\n#define alphaDepth " +
                (o.depth_alpha ? 1 : 0) +
                "\n#define hasMorph " +
                (this.morph ? 1 : 0) +
                "\n#define hasVertexColorMap " +
                (this.color_map ? 1 : 0) +
                "\n#define perPixel " +
                (u.features.lightPerPixel ? 1 : 0) +
                "\n\n"
            );
        },
        bindObject: function (e, g) {
            var a = o.gl,
                b = g.aVertexPosition,
                c = g.aTextureCoord,
                h = g.aNormal,
                d = g.aColor;
            a.bindBuffer(a.ARRAY_BUFFER, e.compiled.gl_points);
            a.vertexAttribPointer(b, 3, a.FLOAT, !1, 0, 0);
            a.enableVertexAttribArray(b);
            c !== null && e.compiled.gl_uvs !== null && c !== -1 && (a.bindBuffer(a.ARRAY_BUFFER, e.compiled.gl_uvs), a.vertexAttribPointer(c, 2, a.FLOAT, !1, 0, 0), a.enableVertexAttribArray(c));
            h !== null && e.compiled.gl_normals !== null && h !== -1 && (a.bindBuffer(a.ARRAY_BUFFER, e.compiled.gl_normals), a.vertexAttribPointer(h, 3, a.FLOAT, !1, 0, 0), a.enableVertexAttribArray(h));
            d !== null && e.compiled.gl_colors !== null && d !== -1 && (a.bindBuffer(a.ARRAY_BUFFER, e.compiled.gl_colors), a.vertexAttribPointer(d, 3, a.FLOAT, !1, 0, 0), a.enableVertexAttribArray(d));
            if (e.morphTarget)
                (b = g.amVertexPosition),
                    (h = g.amNormal),
                    a.bindBuffer(a.ARRAY_BUFFER, e.morphTarget.gl_points),
                    a.vertexAttribPointer(b, 3, a.FLOAT, !1, 0, 0),
                    a.enableVertexAttribArray(b),
                    h !== null && e.morphTarget.gl_normals !== null && h !== -1 && (a.bindBuffer(a.ARRAY_BUFFER, e.morphTarget.gl_normals), a.vertexAttribPointer(h, 3, a.FLOAT, !1, 0, 0), a.enableVertexAttribArray(h)),
                    a.uniform1f(g.morphWeight, e.morphWeight);
            a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, e.compiled.gl_elements);
        },
        clearObject: function (e, g) {
            var a = o.gl,
                b = g.aTextureCoord,
                c = g.aNormal,
                h = g.aColor;
            b !== null && e.compiled.gl_uvs !== null && b !== -1 && a.disableVertexAttribArray(b);
            c !== null && e.compiled.gl_normals !== null && c !== -1 && a.disableVertexAttribArray(c);
            h !== null && e.compiled.gl_colors !== null && h !== -1 && a.disableVertexAttribArray(h);
            if (e.morphTarget) (up = g.amVertexPosition), a.disableVertexAttribArray(up), (c = g.amNormal), c !== null && e.compiled.gl_normals !== null && c !== -1 && a.disableVertexAttribArray(c);
        },
        use: function (e, g) {
            g === r && (g = 0);
            if (this.customShader !== null) this.customShader.use();
            else {
                e === r && (e = 0);
                var a,
                    b = this.textures;
                this.shader[e] === r && (this.shader[e] = []);
                if (this.shader[e][g] === r) {
                    var c = this.calcShaderMask(e);
                    u.ShaderPool[e][c] === r && (u.ShaderPool[e][c] = []);
                    if (u.ShaderPool[e][c][g] === r) {
                        a = this.getShaderHeader(e, g);
                        var h = new CubicVR.Shader(a + o.CoreShader_vs, a + o.CoreShader_fs);
                        u.ShaderPool[e][c][g] = h;
                        a = 0;
                        if (e !== q.light.type.DEPTH_PACK) {
                            if (e === q.light.type.SPOT_SHADOW || e === q.light.type.SPOT_SHADOW_PROJECTOR || e === q.light.type.AREA) (a += g), e === q.light.type.SPOT_SHADOW_PROJECTOR && (a += g);
                            typeof b[q.texture.map.COLOR] === "object" && h.addInt("colorMap", a++);
                            typeof b[q.texture.map.ENVSPHERE] === "object" && h.addInt("envSphereMap", a++);
                            typeof b[q.texture.map.NORMAL] === "object" && h.addInt("normalMap", a++);
                            typeof b[q.texture.map.BUMP] === "object" && h.addInt("bumpMap", a++);
                            typeof b[q.texture.map.REFLECT] === "object" && h.addInt("reflectMap", a++);
                            typeof b[q.texture.map.SPECULAR] === "object" && h.addInt("specularMap", a++);
                            typeof b[q.texture.map.AMBIENT] === "object" && h.addInt("ambientMap", a++);
                        }
                        typeof b[q.texture.map.ALPHA] === "object" && h.addInt("alphaMap", a++);
                        h.addMatrix("uMVMatrix");
                        h.addMatrix("uPMatrix");
                        h.addMatrix("uOMatrix");
                        h.addMatrix("uNMatrix");
                        h.addVertexArray("aVertexPosition");
                        h.addVertexArray("aNormal");
                        this.color_map && h.addVertexArray("aColor");
                        this.morph && (h.addVertexArray("amVertexPosition"), h.addVertexArray("amNormal"), h.addFloat("morphWeight", 0));
                        for (a = 0; a < g; a++)
                            if (
                                (h.addVector("lDiff[" + a + "]"),
                                h.addVector("lSpec[" + a + "]"),
                                h.addFloat("lInt[" + a + "]"),
                                h.addFloat("lDist[" + a + "]"),
                                h.addVector("lPos[" + a + "]"),
                                h.addVector("lDir[" + a + "]"),
                                (e === q.light.type.SPOT_SHADOW || e === q.light.type.SPOT_SHADOW_PROJECTOR || e === q.light.type.SPOT) && h.addFloat("lCut[" + a + "]"),
                                e === q.light.type.SPOT_SHADOW || e === q.light.type.SPOT_SHADOW_PROJECTOR || e === q.light.type.AREA)
                            )
                                h.addInt("lDepthTex[" + a + "]"), e === q.light.type.SPOT_SHADOW_PROJECTOR && h.addInt("lProjTex[" + a + "]"), h.addVector("lDepth[" + a + "]"), h.addMatrix("spMatrix[" + a + "]");
                        e !== q.light.type.DEPTH_PACK && (h.addVector("lAmb"), h.addVector("mDiff"), h.addVector("mColor"), h.addVector("mAmb"), h.addVector("mSpec"), h.addFloat("mShine"), h.addFloat("envAmount"));
                        h.addFloat("mAlpha");
                        (o.depth_alpha || e === q.light.type.DEPTH_PACK || e === q.light.type.SPOT_SHADOW || e === q.light.type.SPOT_SHADOW_PROJECTOR || e === q.light.type.AREA) && h.addVector("depthInfo");
                        h.addUVArray("aTextureCoord");
                    }
                    this.shader[e][g] = u.ShaderPool[e][c][g];
                }
                c = this.shader[e][g];
                h = o.gl;
                c.use();
                a = 0;
                var d;
                if (e !== q.light.type.DEPTH_PACK) {
                    if (e === q.light.type.SPOT_SHADOW || e === q.light.type.SPOT_SHADOW_PROJECTOR || e === q.light.type.AREA) (a += g), e === q.light.type.SPOT_SHADOW_PROJECTOR && (a += g);
                    if ((d = b[q.texture.map.COLOR])) d.use(o.gl.TEXTURE0 + a), a++;
                    if ((d = b[q.texture.map.ENVSPHERE])) d.use(o.gl.TEXTURE0 + a), a++, h.uniform1f(c.envAmount, this.env_amount);
                    if ((d = b[q.texture.map.NORMAL])) d.use(o.gl.TEXTURE0 + a), a++;
                    if ((d = b[q.texture.map.BUMP])) d.use(o.gl.TEXTURE0 + a), a++;
                    if ((d = b[q.texture.map.REFLECT])) d.use(o.gl.TEXTURE0 + a), a++;
                    if ((d = b[q.texture.map.SPECULAR])) d.use(o.gl.TEXTURE0 + a), a++;
                    if ((d = b[q.texture.map.AMBIENT])) d.use(o.gl.TEXTURE0 + a), a++;
                }
                (d = b[q.texture.map.ALPHA]) && d.use(o.gl.TEXTURE0 + a);
                e !== q.light.type.DEPTH_PACK
                    ? (h.uniform3fv(c.mColor, this.color),
                      h.uniform3fv(c.mDiff, this.diffuse),
                      h.uniform3fv(c.mAmb, this.ambient),
                      h.uniform3fv(c.mSpec, this.specular),
                      h.uniform1f(c.mShine, this.shininess * 128),
                      h.uniform3fv(c.lAmb, CubicVR.globalAmbient),
                      (o.depth_alpha || e === q.light.type.SPOT_SHADOW || e === q.light.type.SPOT_SHADOW_PROJECTOR || e === q.light.type.AREA) && h.uniform3fv(c.depthInfo, [o.depth_alpha_near, o.depth_alpha_far, 0]))
                    : h.uniform3fv(c.depthInfo, [o.shadow_near, o.shadow_far, 0]);
                this.opacity !== 1 && h.uniform1f(c.mAlpha, this.opacity);
            }
        },
    };
    return { Material: x };
});
CubicVR.RegisterModule("Math", function (u) {
    function x(a) {
        return this.clearStack(a);
    }
    function r() {
        if (arguments.length === 1) (this.x = arguments[0][0]), (this.y = arguments[0][1]), (this.z = arguments[0][2]), (this.w = arguments[0][3]);
        if (arguments.length === 4) (this.x = arguments[0]), (this.y = arguments[1]), (this.z = arguments[2]), (this.w = arguments[3]);
    }
    var o = u.undef,
        q = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        m = Math.PI / 2,
        e = {
            length: function (a) {
                return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
            },
            normalize: function (a) {
                var b = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
                if (b === 0) return [0, 0, 0];
                return [a[0] / b, a[1] / b, a[2] / b];
            },
            dot: function (a, b) {
                return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
            },
            angle: function (a, b) {
                return Math.acos((a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) * Math.sqrt(b[0] * b[0] + b[1] * b[1] + b[2] * b[2])));
            },
            cross: function (a, b) {
                return [a[1] * b[2] - b[1] * a[2], a[2] * b[0] - b[2] * a[0], a[0] * b[1] - b[0] * a[1]];
            },
            multiply: function (a, b) {
                return [a[0] * b, a[1] * b, a[2] * b];
            },
            add: function (a, b) {
                return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
            },
            subtract: function (a, b) {
                return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
            },
            equal: function (a, b, c) {
                c === o && (c = 1.0e-7);
                if (a === o && b === o) return !0;
                if (a === o || b === o) return !1;
                return Math.abs(a[0] - b[0]) < c && Math.abs(a[1] - b[1]) < c && Math.abs(a[2] - b[2]) < c;
            },
            moveViewRelative: function (a, b, c, h, d) {
                var n = Math.sqrt(c * c + h * h),
                    b = Math.atan2(b[2] - a[2], b[0] - a[0]) + Math.atan2(h, c) + m;
                if (typeof d === "object") return [d[0] + n * Math.cos(b), d[1], d[2] + n * Math.sin(b)];
                return [a[0] + n * Math.cos(b), a[1], a[2] + n * Math.sin(b)];
            },
            trackTarget: function (a, b, c, h) {
                var b = e.subtract(b, a),
                    d = e.length(b),
                    n;
                n = e.normalize(b);
                n = e.multiply(n, c * (1 / (1 / (d - h))));
                d > h ? (a = e.add(a, n)) : d < h ? ((n = e.normalize(b)), (n = e.multiply(n, c * (1 / (1 / Math.abs(d - h))))), (a = e.subtract(a, n))) : (a = [a[0], a[1] + n[2], a[2]]);
                return a;
            },
            getClosestTo: function (a, b, c) {
                b = e.subtract(b, a);
                c = e.subtract(c, a);
                return e.add(e.multiply(b, e.dot(b, c) / e.dot(b, b)), a);
            },
            linePlaneIntersect: function (a, b, c, h) {
                var d = -a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
                    b = a[0] * (h[0] - c[0]) + a[1] * (h[1] - c[1]) + a[2] * (h[2] - c[2]);
                if (Math.abs(b) < 0.001) return !1;
                a = -(d + a[0] * c[0] + a[1] * c[1] + a[2] * c[2]) / b;
                return [c[0] + a * (h[0] - c[0]), c[1] + a * (h[1] - c[1]), c[2] + a * (h[2] - c[2])];
            },
        },
        g = {
            lookat: function (a, b, c, h, d, n, t, s, g) {
                var m = [],
                    q = [],
                    v = [],
                    q = [];
                m[0] = h - a;
                m[1] = d - b;
                m[2] = n - c;
                v[0] = t;
                v[1] = s;
                v[2] = g;
                m = e.normalize(m);
                q = e.cross(m, v);
                q = e.normalize(q);
                v = e.cross(q, m);
                q = [q[0], v[0], -m[0], 0, q[1], v[1], -m[1], 0, q[2], v[2], -m[2], 0, 0, 0, 0, 1];
                h = new CubicVR.Transform(q);
                h.translate([-a, -b, -c]);
                return h.getResult();
            },
            multiply: function (a, b, c) {
                c === o && (c = []);
                c[0] = a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3];
                c[1] = a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3];
                c[2] = a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3];
                c[3] = a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3];
                c[4] = a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7];
                c[5] = a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7];
                c[6] = a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7];
                c[7] = a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7];
                c[8] = a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11];
                c[9] = a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11];
                c[10] = a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11];
                c[11] = a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11];
                c[12] = a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15];
                c[13] = a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15];
                c[14] = a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15];
                c[15] = a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15];
                return c;
            },
            vec4_multiply: function (a, b, c) {
                c === o && (c = []);
                c[0] = b[0] * a[0] + b[4] * a[1] + b[8] * a[2] + b[12] * a[3];
                c[1] = b[1] * a[0] + b[5] * a[1] + b[9] * a[2] + b[13] * a[3];
                c[2] = b[2] * a[0] + b[6] * a[1] + b[10] * a[2] + b[14] * a[3];
                c[3] = b[3] * a[0] + b[7] * a[1] + b[11] * a[2] + b[15] * a[3];
                return c;
            },
            vec3_multiply: function (a, b, c) {
                c === o && (c = []);
                c[0] = b[0] * a[0] + b[4] * a[1] + b[8] * a[2] + b[12];
                c[1] = b[1] * a[0] + b[5] * a[1] + b[9] * a[2] + b[13];
                c[2] = b[2] * a[0] + b[6] * a[1] + b[10] * a[2] + b[14];
                return c;
            },
            perspective: function (a, b, c, h) {
                a = Math.tan((a * Math.PI) / 360);
                return [1 / (a * b), 0, 0, 0, 0, 1 / a, 0, 0, 0, 0, -(h + c) / (h - c), -1, 0, 0, -(2 * h * c) / (h - c), 0];
            },
            ortho: function (a, b, c, h, d, n) {
                return [2 / (b - a), 0, 0, 0, 0, 2 / (h - c), 0, 0, 0, 0, -2 / (n - d), 0, -(a + b) / (b - a), -(h + c) / (h - c), -(n + d) / (n - d), 1];
            },
            determinant: function (a) {
                return (
                    (a[0] * a[5] - a[1] * a[4]) * (a[10] * a[15] - a[11] * a[14]) -
                    (a[0] * a[6] - a[2] * a[4]) * (a[9] * a[15] - a[11] * a[13]) +
                    (a[0] * a[7] - a[3] * a[4]) * (a[9] * a[14] - a[10] * a[13]) +
                    (a[1] * a[6] - a[2] * a[5]) * (a[8] * a[15] - a[11] * a[12]) -
                    (a[1] * a[7] - a[3] * a[5]) * (a[8] * a[14] - a[10] * a[12]) +
                    (a[2] * a[7] - a[3] * a[6]) * (a[8] * a[13] - a[9] * a[12])
                );
            },
            coFactor: function () {},
            transpose: function (a) {
                return [a[0], a[4], a[8], a[12], a[1], a[5], a[9], a[13], a[2], a[6], a[10], a[14], a[3], a[7], a[11], a[15]];
            },
            inverse_mat3: function (a) {
                var b = [],
                    c = a[0],
                    h = a[1],
                    d = a[2],
                    n = a[4],
                    t = a[5],
                    e = a[6],
                    g = a[8],
                    m = a[9],
                    a = a[10],
                    q = a * t - e * m,
                    v = -a * n + e * g,
                    o = m * n - t * g,
                    r = c * q + h * v + d * o;
                if (!r) return null;
                r = 1 / r;
                b[0] = q * r;
                b[1] = (-a * h + d * m) * r;
                b[2] = (e * h - d * t) * r;
                b[3] = v * r;
                b[4] = (a * c - d * g) * r;
                b[5] = (-e * c + d * n) * r;
                b[6] = o * r;
                b[7] = (-m * c + h * g) * r;
                b[8] = (t * c - h * n) * r;
                return b;
            },
            inverse: function (a, b) {
                var c = a[0] * a[5] - a[1] * a[4],
                    h = a[0] * a[6] - a[2] * a[4],
                    d = a[0] * a[7] - a[3] * a[4],
                    n = a[1] * a[6] - a[2] * a[5],
                    e = a[1] * a[7] - a[3] * a[5],
                    s = a[2] * a[7] - a[3] * a[6],
                    g = a[8] * a[13] - a[9] * a[12],
                    m = a[8] * a[14] - a[10] * a[12],
                    q = a[8] * a[15] - a[11] * a[12],
                    v = a[9] * a[14] - a[10] * a[13],
                    r = a[9] * a[15] - a[11] * a[13],
                    z = a[10] * a[15] - a[11] * a[14],
                    A = c * z - h * r + d * v + n * q - e * m + s * g;
                if (A !== 0)
                    return (
                        b === o && (b = []),
                        (b[0] = 0 + a[5] * z - a[6] * r + a[7] * v),
                        (b[4] = 0 - a[4] * z + a[6] * q - a[7] * m),
                        (b[8] = 0 + a[4] * r - a[5] * q + a[7] * g),
                        (b[12] = 0 - a[4] * v + a[5] * m - a[6] * g),
                        (b[1] = 0 - a[1] * z + a[2] * r - a[3] * v),
                        (b[5] = 0 + a[0] * z - a[2] * q + a[3] * m),
                        (b[9] = 0 - a[0] * r + a[1] * q - a[3] * g),
                        (b[13] = 0 + a[0] * v - a[1] * m + a[2] * g),
                        (b[2] = 0 + a[13] * s - a[14] * e + a[15] * n),
                        (b[6] = 0 - a[12] * s + a[14] * d - a[15] * h),
                        (b[10] = 0 + a[12] * e - a[13] * d + a[15] * c),
                        (b[14] = 0 - a[12] * n + a[13] * h - a[14] * c),
                        (b[3] = 0 - a[9] * s + a[10] * e - a[11] * n),
                        (b[7] = 0 + a[8] * s - a[10] * d + a[11] * h),
                        (b[11] = 0 - a[8] * e + a[9] * d - a[11] * c),
                        (b[15] = 0 + a[8] * n - a[9] * h + a[10] * c),
                        (c = 1 / A),
                        (b[0] *= c),
                        (b[1] *= c),
                        (b[2] *= c),
                        (b[3] *= c),
                        (b[4] *= c),
                        (b[5] *= c),
                        (b[6] *= c),
                        (b[7] *= c),
                        (b[8] *= c),
                        (b[9] *= c),
                        (b[10] *= c),
                        (b[11] *= c),
                        (b[12] *= c),
                        (b[13] *= c),
                        (b[14] *= c),
                        (b[15] *= c),
                        b
                    );
                return null;
            },
            identity: function (a) {
                if (a == o) return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
                a[0] = 1;
                a[1] = 0;
                a[2] = 0;
                a[3] = 0;
                a[4] = 0;
                a[5] = 1;
                a[6] = 0;
                a[7] = 0;
                a[8] = 0;
                a[9] = 0;
                a[10] = 1;
                a[11] = 0;
                a[12] = 0;
                a[13] = 0;
                a[14] = 0;
                a[15] = 1;
            },
            translate: function (a, b, c, h) {
                a = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, a, b, c, 1];
                if (h === o) return a;
                g.multiply(h.slice(0), a, h);
            },
            rotateAxis: function (a, b, c, h, d) {
                var n = Math.sin(a * (Math.PI / 180)),
                    a = Math.cos(a * (Math.PI / 180)),
                    b = [
                        a + b * b * (1 - a),
                        b * c * (1 - a) - h * n,
                        b * h * (1 - a) + c * n,
                        0,
                        c * b * (1 - a) + h * n,
                        a + c * c * (1 - a),
                        c * h * (1 - a) - b * n,
                        0,
                        h * b * (1 - a) - c * n,
                        h * c * (1 - a) + b * n,
                        a + h * h * (1 - a),
                        0,
                        0,
                        0,
                        0,
                        1,
                    ];
                if (d === o) return b;
                g.multiply(d.slice(0), b, d);
            },
            rotate: function (a, b, c, h) {
                var d;
                h === o && (h = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
                c !== 0 && ((d = Math.sin(c * (Math.PI / 180))), (c = Math.cos(c * (Math.PI / 180))), g.multiply(h.slice(0), [c, d, 0, 0, -d, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], h));
                b !== 0 && ((d = Math.sin(b * (Math.PI / 180))), (c = Math.cos(b * (Math.PI / 180))), g.multiply(h.slice(0), [c, 0, -d, 0, 0, 1, 0, 0, d, 0, c, 0, 0, 0, 0, 1], h));
                a !== 0 && ((d = Math.sin(a * (Math.PI / 180))), (c = Math.cos(a * (Math.PI / 180))), g.multiply(h.slice(0), [1, 0, 0, 0, 0, c, d, 0, 0, -d, c, 0, 0, 0, 0, 1], h));
                return h;
            },
            scale: function (a, b, c, h) {
                if (h === o) return [a, 0, 0, 0, 0, b, 0, 0, 0, 0, c, 0, 0, 0, 0, 1];
                g.multiply(h.slice(0), [a, 0, 0, 0, 0, b, 0, 0, 0, 0, c, 0, 0, 0, 0, 1], h);
            },
        };
    x.prototype = {
        setIdentity: function () {
            this.m_stack[this.c_stack] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            this.valid === this.c_stack && this.c_stack && this.valid--;
            return this;
        },
        getIdentity: function () {
            return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        },
        invalidate: function () {
            this.valid = 0;
            this.result = null;
            return this;
        },
        getResult: function () {
            var a = CubicVR.mat4;
            if (!this.c_stack) return this.m_stack[0];
            var b = q;
            if (this.valid > this.c_stack - 1) this.valid = this.c_stack - 1;
            for (var c = this.valid; c < this.c_stack + 1; c++) (b = a.multiply(b, this.m_stack[c])), (this.m_cache[c] = b);
            this.valid = this.c_stack - 1;
            return (this.result = this.m_cache[this.c_stack]);
        },
        pushMatrix: function (a) {
            this.c_stack++;
            this.m_stack[this.c_stack] = a ? a : q;
            return this;
        },
        popMatrix: function () {
            if (this.c_stack !== 0) return this.c_stack--, this;
        },
        clearStack: function (a) {
            this.m_stack = [];
            this.m_cache = [];
            this.valid = this.c_stack = 0;
            this.result = null;
            a !== o ? (this.m_stack[0] = a) : this.setIdentity();
            return this;
        },
        translate: function (a, b, c) {
            var h = CubicVR.mat4;
            if (typeof a === "object") return this.translate(a[0], a[1], a[2]);
            var d = this.getIdentity();
            d[12] = a;
            d[13] = b;
            d[14] = c;
            this.m_stack[this.c_stack] = h.multiply(this.m_stack[this.c_stack], d);
            this.valid === this.c_stack && this.c_stack && this.valid--;
            return this;
        },
        scale: function (a, b, c) {
            var h = CubicVR.mat4;
            if (typeof a === "object") return this.scale(a[0], a[1], a[2]);
            var d = this.getIdentity();
            d[0] = a;
            d[5] = b;
            d[10] = c;
            this.m_stack[this.c_stack] = h.multiply(this.m_stack[this.c_stack], d);
            this.valid === this.c_stack && this.c_stack && this.valid--;
            return this;
        },
        rotate: function (a, b, c, h) {
            var d = CubicVR.mat4;
            if (typeof a === "object") return this.rotate(a[0], 1, 0, 0), this.rotate(a[1], 0, 1, 0), this.rotate(a[2], 0, 0, 1), this;
            var n, e;
            if (b || c || h) (n = Math.sin(-a * (Math.PI / 180))), (e = Math.cos(-a * (Math.PI / 180)));
            b && ((a = this.getIdentity()), (a[5] = e * b), (a[9] = n * b), (a[6] = -n * b), (a[10] = e * b), (this.m_stack[this.c_stack] = d.multiply(a, this.m_stack[this.c_stack])));
            c && ((b = this.getIdentity()), (b[0] = e * c), (b[8] = -n * c), (b[2] = n * c), (b[10] = e * c), (this.m_stack[this.c_stack] = d.multiply(b, this.m_stack[this.c_stack])));
            h && ((c = this.getIdentity()), (c[0] = e * h), (c[4] = n * h), (c[1] = -n * h), (c[5] = e * h), (this.m_stack[this.c_stack] = d.multiply(c, this.m_stack[this.c_stack])));
            this.valid === this.c_stack && this.c_stack && this.valid--;
            return this;
        },
    };
    r.prototype = {
        length: function () {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
        },
        normalize: function () {
            var a = Math.sqrt(this.length());
            this.x /= a;
            this.y /= a;
            this.z /= a;
            this.w /= a;
        },
        fromMatrix: function (a) {
            var b = 1 + a[0] + a[5] + a[10],
                c,
                h,
                d;
            b > 1.0e-8
                ? ((c = Math.sqrt(b) * 2), (b = (a[9] - a[6]) / c), (h = (a[2] - a[8]) / c), (d = (a[4] - a[1]) / c), (a = 0.25 * c))
                : a[0] > a[5] && a[0] > a[10]
                ? ((c = Math.sqrt(1 + a[0] - a[5] - a[10]) * 2), (b = 0.25 * c), (h = (a[4] + a[1]) / c), (d = (a[2] + a[8]) / c), (a = (a[9] - a[6]) / c))
                : a[5] > a[10]
                ? ((c = Math.sqrt(1 + a[5] - a[0] - a[10]) * 2), (b = (a[4] + a[1]) / c), (h = 0.25 * c), (d = (a[9] + a[6]) / c), (a = (a[2] - a[8]) / c))
                : ((c = Math.sqrt(1 + a[10] - a[0] - a[5]) * 2), (b = (a[2] + a[8]) / c), (h = (a[9] + a[6]) / c), (d = 0.25 * c), (a = (a[4] - a[1]) / c));
            this.x = b;
            this.y = h;
            this.z = d;
            this.w = a;
        },
        fromEuler: function (a, b, c) {
            var h = Math.cos(((Math.PI / 180) * b) / 2),
                b = Math.sin(((Math.PI / 180) * b) / 2),
                d = Math.cos(((Math.PI / 180) * c) / 2),
                c = Math.sin(((Math.PI / 180) * c) / 2),
                n = Math.cos(((Math.PI / 180) * a) / 2),
                a = Math.sin(((Math.PI / 180) * a) / 2),
                e = h * d,
                s = b * c;
            this.w = e * n - s * a;
            this.x = e * a + s * n;
            this.y = b * d * n + h * c * a;
            this.z = h * c * n - b * d * a;
        },
        toEuler: function () {
            var a = this.w * this.w,
                b = this.x * this.x,
                c = this.y * this.y,
                h = this.z * this.z;
            return [
                (180 / Math.PI) * Math.atan2(2 * (this.y * this.z + this.x * this.w), -b - c + h + a),
                (180 / Math.PI) * Math.asin(-2 * (this.x * this.z - this.y * this.w)),
                (180 / Math.PI) * Math.atan2(2 * (this.x * this.y + this.z * this.w), b - c - h + a),
            ];
        },
        multiply: function (a, b) {
            b === o && ((b = a), (a = this));
            return new r(a.x * b.w + a.w * b.x + a.y * b.z - a.z * b.y, a.y * b.w + a.w * b.y + a.z * b.x - a.x * b.z, a.z * b.w + a.w * b.z + a.x * b.y - a.y * b.x, a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z);
        },
    };
    return {
        vec2: {
            equal: function (a, b, c) {
                c === o && (c = 1.0e-8);
                if (a === o && b === o) return !0;
                if (a === o || b === o) return !1;
                return Math.abs(a[0] - b[0]) < c && Math.abs(a[1] - b[1]) < c;
            },
        },
        vec3: e,
        mat3: {
            transpose_inline: function (a) {
                var b = a[1],
                    c = a[2],
                    h = a[5];
                a[1] = a[3];
                a[2] = a[6];
                a[3] = b;
                a[5] = a[7];
                a[6] = c;
                a[7] = h;
            },
            vec3_multiply: function (a, b, c) {
                c === o && (c = []);
                c[0] = b[0] * a[0] + b[3] * a[1] + b[6] * a[2];
                c[1] = b[1] * a[0] + b[4] * a[1] + b[7] * a[2];
                c[2] = b[2] * a[0] + b[5] * a[1] + b[8] * a[2];
                return c;
            },
        },
        mat4: g,
        aabb: {
            engulf: function (a, b) {
                a[0][0] > b[0] && (a[0][0] = b[0]);
                a[0][1] > b[1] && (a[0][1] = b[1]);
                a[0][2] > b[2] && (a[0][2] = b[2]);
                a[1][0] < b[0] && (a[1][0] = b[0]);
                a[1][1] < b[1] && (a[1][1] = b[1]);
                a[1][2] < b[2] && (a[1][2] = b[2]);
            },
            reset: function (a, b) {
                b === void 0 && (b = [0, 0, 0]);
                a[0][0] = b[0];
                a[0][1] = b[1];
                a[0][2] = b[2];
                a[1][0] = b[0];
                a[1][1] = b[1];
                a[1][2] = b[2];
            },
            size: function (a) {
                return [a[0][0] < a[1][0] ? a[1][0] - a[0][0] : a[0][0] - a[1][0], a[0][1] < a[1][1] ? a[1][1] - a[0][1] : a[0][1] - a[1][1], a[0][2] < a[1][2] ? a[1][2] - a[0][2] : a[0][2] - a[1][2]];
            },
        },
        plane: {
            classifyPoint: function (a, b) {
                var c = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3];
                if (c < 0) return -1;
                else if (c > 0) return 1;
                return 0;
            },
            normalize: function (a) {
                var b = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
                a[0] /= b;
                a[1] /= b;
                a[2] /= b;
                a[3] /= b;
            },
        },
        sphere: {
            intersects: function (a, b) {
                var c = CubicVR.vec3.subtract([a[0], a[1], a[2]], [b[0], b[1], b[2]]),
                    c = Math.sqrt(c[0] * c[0] + c[1] * c[1] + c[2] * c[2]),
                    h = a[3] + b[3];
                if (c * c < h * h) return !0;
                return !1;
            },
        },
        triangle: {
            normal: function (a, b, c, h) {
                h === o && (h = []);
                var d = a[0] - b[0],
                    n = a[1] - b[1],
                    a = a[2] - b[2],
                    e = b[0] - c[0],
                    s = b[1] - c[1],
                    b = b[2] - c[2];
                h[0] = n * b - a * s;
                h[1] = a * e - d * b;
                h[2] = d * s - n * e;
                return h;
            },
        },
        Transform: x,
        Quaternion: r,
    };
});
CubicVR.RegisterModule("Mesh", function (u) {
    function x() {
        this.points = [];
        this.point_normals = [];
        this.point_colors = [];
        this.uvs = [];
        this.normal = [0, 0, 0];
        this.segment = this.material = 0;
    }
    function r(m) {
        this.points = [];
        this.faces = [];
        this.currentFace = -1;
        this.currentSegment = this.currentMaterial = 0;
        this.bb = this.originBuffer = this.compiled = null;
        this.name = m ? m : null;
        this.materials = [];
        this.morphTarget = this.morphTargets = this.bb = null;
        this.morphWeight = 0;
        this.morphTargetIndex = this.morphSourceIndex = -1;
        this.instanceMaterials = null;
    }
    var o = u.undef,
        q = u.GLCore;
    x.prototype = {
        setUV: function (m, e) {
            e !== o ? (this.uvs[e] = m) : m.length !== 2 ? (this.uvs = m) : this.uvs.push(m);
        },
        setColor: function (m, e) {
            e !== o ? (this.point_colors[e] = m) : typeof colors[0] !== "number" ? (this.point_colors = m) : this.point_colors.push(m);
        },
        flip: function () {
            for (var m = 0, e = this.point_normals.length; m < e; m++) this.point_normals[m] = [-this.point_normals[m][0], -this.point_normals[m][1], -this.point_normals[m][2]];
            this.points.reverse();
            this.point_normals.reverse();
            this.uvs.reverse();
            this.normal = [-this.normal[0], -this.normal[1], -this.normal[2]];
        },
    };
    r.prototype = {
        showAllSegments: function () {
            for (var m in this.segment_state) this.segment_state.hasOwnProperty(m) && (this.segment_state[m] = !0);
        },
        hideAllSegments: function () {
            for (var m in this.segment_state) this.segment_state.hasOwnProperty(m) && (this.segment_state[m] = !1);
        },
        setSegment: function (m, e) {
            e !== o ? (this.segment_state[m] = e) : (this.currentSegment = m);
        },
        addPoint: function (m) {
            if (m.length !== 3 || typeof m[0] === "object") for (var e = 0, g = m.length; e < g; e++) this.points.push(m[e]);
            else this.points.push(m);
            return this.points.length - 1;
        },
        getMaterialIndex: function (m) {
            return this.materials.indexOf(m);
        },
        setFaceMaterial: function (m, e) {
            var g;
            typeof m == "number" ? (g = m) : ((g = this.materials.indexOf(m)), g === -1 && (this.materials.push(m), (g = this.materials.length - 1)));
            if (e !== o) {
                if (this.faces[e] !== o) this.faces[e].material = g;
            } else this.currentMaterial = g;
            return this;
        },
        addFace: function (m, e, g, a) {
            if (typeof m[0] !== "number") {
                e = 0;
                for (g = m.length; e < g; e++) this.addFace(m[e]);
            } else {
                e === o ? ((this.currentFace = this.faces.length), this.faces.push(new x())) : (this.faces[e] === o && (this.faces[e] = new x()), (this.currentFace = e));
                if (typeof m === "object") this.faces[this.currentFace].points = m;
                g !== o ? this.setFaceMaterial(g, this.currentFace) : (this.faces[this.currentFace].material = this.currentMaterial);
                this.faces[this.currentFace].segment = a !== o ? a : this.currentSegment;
                return this.currentFace;
            }
        },
        flipFaces: function () {
            for (var m = 0, e = this.faces.length; m < e; m++) this.faces[m].flip();
        },
        triangulateQuads: function () {
            for (var m = 0, e = this.faces.length; m < e; m++)
                if (this.faces[m].points.length === 4) {
                    var g = this.faces.length;
                    this.addFace([this.faces[m].points[2], this.faces[m].points[3], this.faces[m].points[0]], this.faces.length, this.faces[m].material, this.faces[m].segment);
                    this.faces[m].points.pop();
                    this.faces[g].normal = this.faces[m].normal;
                    this.faces[m].uvs !== o &&
                        this.faces[m].uvs.length === 4 &&
                        (this.faces[g].setUV(this.faces[m].uvs[2], 0), this.faces[g].setUV(this.faces[m].uvs[3], 1), this.faces[g].setUV(this.faces[m].uvs[0], 2), this.faces[m].uvs.pop());
                    this.faces[m].point_normals.length === 4 &&
                        ((this.faces[g].point_normals[0] = this.faces[m].point_normals[2]),
                        (this.faces[g].point_normals[1] = this.faces[m].point_normals[3]),
                        (this.faces[g].point_normals[2] = this.faces[m].point_normals[0]),
                        this.faces[m].point_normals.pop());
                }
            return this;
        },
        booleanAdd: function (m, e) {
            var g = CubicVR.mat4,
                a = this.points.length,
                b,
                c,
                h,
                d;
            if (e !== o) {
                c = e.getResult();
                b = 0;
                for (h = m.points.length; b < h; b++) this.addPoint(g.vec3_multiply(m.points[b], c));
            } else {
                b = 0;
                for (h = m.points.length; b < h; b++) this.addPoint([m.points[b][0], m.points[b][1], m.points[b][2]]);
            }
            g = [];
            b = 0;
            for (h = m.materials.length; b < h; b++) (c = this.materials.indexOf(m.materials[b])), c === -1 ? (this.materials.push(m.materials[b]), (g[b] = this.materials.length - 1)) : (g[b] = c);
            b = 0;
            for (h = m.faces.length; b < h; b++) {
                var n = [];
                c = 0;
                for (d = m.faces[b].points.length; c < d; c++) n.push(m.faces[b].points[c] + a);
                n = this.faces[this.addFace(n)];
                n.segment = m.faces[b].segment;
                n.material = g[m.faces[b].material];
                if (n.material === o) n.material = 0;
                c = 0;
                for (d = m.faces[b].uvs.length; c < d; c++) n.uvs[c] = [m.faces[b].uvs[c][0], m.faces[b].uvs[c][1]];
                c = 0;
                for (d = m.faces[b].point_normals.length; c < d; c++) n.point_normals[c] = [m.faces[b].point_normals[c][0], m.faces[b].point_normals[c][1], m.faces[b].point_normals[c][2]];
            }
            return this;
        },
        calcFaceNormals: function (m, e) {
            var g = CubicVR.vec3,
                a = CubicVR.triangle,
                b = 0,
                c = this.faces.length;
            m && (b = m);
            for (e && (c = e + 1); b < c; b++)
                this.faces[b].normal = this.faces[b].points.length < 3 ? [0, 0, 0] : g.normalize(a.normal(this.points[this.faces[b].points[0]], this.points[this.faces[b].points[1]], this.points[this.faces[b].points[2]]));
            return this;
        },
        getMaterial: function (m) {
            for (var e = 0, g = this.materials.length; e < g; e++) if (this.materials[e].name === m) return this.materials[e];
            return null;
        },
        bindInstanceMaterials: function (m) {
            this.instanceMaterials = m;
        },
        calcNormals: function (m) {
            var e = CubicVR.vec3,
                g = !1;
            m !== o && (g = !0);
            this.calcFaceNormals();
            var a,
                b,
                c,
                h,
                d = Array(this.points.length);
            a = 0;
            for (h = d.length; a < h; a++) d[a] = [];
            c = this.faces.length;
            for (a = 0; a < c; a++) {
                h = this.faces[a].points.length;
                for (b = 0; b < h; b++) d[this.faces[a].points[b]].push([a, b]);
            }
            a = 0;
            for (h = this.points.length; a < h; a++) {
                var n = d[a].length;
                for (b = 0; b < n; b++) {
                    var t = 1,
                        s = d[a][b][0],
                        q = d[a][b][1],
                        C = this.materials.length ? this.materials[this.faces[s].material].max_smooth : 60,
                        r = this.faces[s];
                    g && (m[s] === o && (m[s] = []), m[s][q] === o && (m[s][q] = []));
                    var v = Array(3);
                    v[0] = r.normal[0];
                    v[1] = r.normal[1];
                    v[2] = r.normal[2];
                    if (C !== 0)
                        for (c = 0; c < n; c++)
                            if (b !== c) {
                                var D = d[a][c][0],
                                    z = this.faces[D],
                                    A = e.angle(z.normal, r.normal);
                                if (A !== A || A * (180 / Math.PI) <= C) g && m[s][q].push(D), (v[0] += z.normal[0]), (v[1] += z.normal[1]), (v[2] += z.normal[2]), t++;
                            }
                    v[0] /= t;
                    v[1] /= t;
                    v[2] /= t;
                    this.faces[s].point_normals[q] = e.normalize(v);
                }
            }
            return this;
        },
        recalcNormals: function (m) {
            this.calcFaceNormals();
            for (var e = 0, g = this.faces.length; e < g; e++)
                for (var a = this.faces[e], b = 0, c = a.points.length; b < c; b++) {
                    var h = m[e][b],
                        d = a.point_normals[b];
                    d[0] = a.normal[0];
                    d[1] = a.normal[1];
                    d[2] = a.normal[2];
                    for (var n = h.length, t = 0; t < n; t++) {
                        var s = this.faces[h[t]];
                        d[0] += s.normal[0];
                        d[1] += s.normal[1];
                        d[2] += s.normal[2];
                    }
                    n !== 0 && ((d[0] /= n + 1), (d[1] /= n + 1), (d[2] /= n + 1), (h = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2])), (d[0] /= h), (d[1] /= h), (d[2] /= h));
                }
            return this;
        },
        removeDoubles: function () {
            var m = [],
                e = [],
                g,
                a,
                b,
                c;
            g = 0;
            for (a = this.points.length; g < a; g++) {
                var h = -1,
                    d = this.points[g];
                b = 0;
                for (c = m.length; b < c; b++)
                    if (CubicVR.vec3.equal(d, m[b])) {
                        h = b;
                        break;
                    }
                h != -1 ? (e[g] = h) : ((e[g] = m.length), m.push(this.points[g]));
            }
            this.points = m;
            g = 0;
            for (a = this.faces.length; g < a; g++) {
                m = this.faces[g];
                b = 0;
                for (c = m.points.length; b < c; b++) m.points[b] = e[m.points[b]];
            }
        },
        prepare: function (m) {
            m === o && (m = !0);
            this.calcNormals().triangulateQuads().compile();
            m && this.clean();
            return this;
        },
        clean: function () {
            var m, e;
            m = 0;
            for (e = this.points.length; m < e; m++) delete this.points[m], (this.points[m] = null);
            this.points = [];
            m = 0;
            for (e = this.faces.length; m < e; m++) delete this.faces[m].points, delete this.faces[m].point_normals, delete this.faces[m].uvs, delete this.faces[m].normal, delete this.faces[m], (this.faces[m] = null);
            this.faces = [];
            return this;
        },
        compileMap: function (m) {
            var e = CubicVR.vec3,
                g = CubicVR.vec2;
            m === o && (m = 1.0e-5);
            var a = { segments: [], bounds: [] },
                b = [],
                c,
                h,
                d,
                n,
                t,
                s,
                q,
                C;
            this.materials.length || this.materials.push(new CubicVR.Material());
            c = 0;
            for (s = this.materials.length; c < s; c++) b[c] = [];
            c = 0;
            for (s = this.faces.length; c < s; c++) if (this.faces[c].points.length === 3) (d = this.faces[c].material), (n = this.faces[c].segment), b[d][n] === o && ((b[d][n] = []), a.segments.push(n)), b[d][n].push(c);
            var r = [],
                v = 0,
                D = !1,
                z = !1,
                A = !1,
                w;
            c = 0;
            for (s = b.length; c < s; c++)
                for (h in b[c])
                    if (b[c].hasOwnProperty(h))
                        for (d = 0; d < b[c][h].length; d++) (w = b[c][h][d]), (D = D || this.faces[w].uvs.length !== 0), (z = z || this.faces[w].point_normals.length !== 0), (A = A || this.faces[w].point_colors.length !== 0);
            if (D) for (c = 0; c < this.faces.length; c++) if (!this.faces[c].uvs.length) for (h = 0; h < this.faces[c].points.length; h++) this.faces[c].uvs.push([0, 0]);
            if (z) for (c = 0; c < this.faces.length; c++) if (!this.faces[c].point_normals.length) for (h = 0; h < this.faces[c].points.length; h++) this.faces[c].point_normals.push([0, 0, 0]);
            if (A) for (c = 0; c < this.faces.length; c++) if (!this.faces[c].point_colors.length) for (h = 0; h < this.faces[c].points.length; h++) this.faces[c].point_colors.push([0, 0, 0]);
            c = 0;
            for (s = b.length; c < s; c++)
                for (h in b[c])
                    if (b[c].hasOwnProperty(h)) {
                        d = 0;
                        for (q = b[c][h].length; d < q; d++) {
                            w = b[c][h][d];
                            for (n = 0; n < 3; n++) {
                                var y = this.faces[w].points[n],
                                    u = -1;
                                if (r[y] !== o) {
                                    t = 0;
                                    for (C = r[y].length; t < C; t++) {
                                        var B = r[y][t][0],
                                            x = r[y][t][1],
                                            u = r[y][t][2];
                                        z && (u = e.equal(this.faces[B].point_normals[x], this.faces[w].point_normals[n], m) ? u : -1);
                                        D && (u = g.equal(this.faces[B].uvs[x], this.faces[w].uvs[n], m) ? u : -1);
                                        A && (u = e.equal(this.faces[B].point_colors[x], this.faces[w].point_colors[n], m) ? u : -1);
                                    }
                                }
                                if (u !== -1) {
                                    if (a.elements === o) a.elements = [];
                                    a.elements[c] === o && (a.elements[c] = []);
                                    a.elements[c][h] === o && (a.elements[c][h] = []);
                                    a.elements[c][h].push(u);
                                } else {
                                    if (a.points === o) a.points = [];
                                    a.points.push(y);
                                    a.bounds.length === 0
                                        ? ((a.bounds[0] = [this.points[y][0], this.points[y][1], this.points[y][2]]), (a.bounds[1] = [this.points[y][0], this.points[y][1], this.points[y][2]]))
                                        : (this.points[y][0] < a.bounds[0][0] && (a.bounds[0][0] = this.points[y][0]),
                                          this.points[y][1] < a.bounds[0][1] && (a.bounds[0][1] = this.points[y][1]),
                                          this.points[y][2] < a.bounds[0][2] && (a.bounds[0][2] = this.points[y][2]),
                                          this.points[y][0] > a.bounds[1][0] && (a.bounds[1][0] = this.points[y][0]),
                                          this.points[y][1] > a.bounds[1][1] && (a.bounds[1][1] = this.points[y][1]),
                                          this.points[y][2] > a.bounds[1][2] && (a.bounds[1][2] = this.points[y][2]));
                                    if (z) {
                                        if (a.normals === o) a.normals = [];
                                        a.normals.push([w, n]);
                                    }
                                    if (A) {
                                        if (a.colors === o) a.colors = [];
                                        a.colors.push([w, n]);
                                    }
                                    if (D) {
                                        if (a.uvs === o) a.uvs = [];
                                        a.uvs.push([w, n]);
                                    }
                                    if (a.elements === o) a.elements = [];
                                    a.elements[c] === o && (a.elements[c] = []);
                                    a.elements[c][h] === o && (a.elements[c][h] = []);
                                    a.elements[c][h].push(v);
                                    r[y] === o && (r[y] = []);
                                    r[y].push([w, n, v]);
                                    v++;
                                }
                            }
                        }
                    }
            a.elements || console.log(this);
            return a;
        },
        compileVBO: function (m, e, g, a, b, c) {
            typeof e == "object"
                ? ((e = e.element !== o ? e.element : !0), (g = e.vertex !== o ? e.vertex : !0), (c = e.color !== o ? e.color : !0), (a = e.normal !== o ? e.normal : !0), (b = e.uv !== o ? e.uv : !0))
                : (e === o && (e = !0), g === o && (g = !0), c === o && (c = !0), a === o && (a = !0), b === o && (b = !0));
            var h = {},
                d,
                n,
                t;
            if (m.points && g) {
                d = m.points.length;
                h.vbo_points = new Float32Array(d * 3);
                for (g = n = 0; g < d; g++) (t = m.points[g]), (h.vbo_points[n++] = this.points[t][0]), (h.vbo_points[n++] = this.points[t][1]), (h.vbo_points[n++] = this.points[t][2]);
            }
            if (m.normals && a) {
                d = m.normals.length;
                h.vbo_normals = new Float32Array(d * 3);
                for (g = n = 0; g < d; g++)
                    (t = m.normals[g]), (h.vbo_normals[n++] = this.faces[t[0]].point_normals[t[1]][0]), (h.vbo_normals[n++] = this.faces[t[0]].point_normals[t[1]][1]), (h.vbo_normals[n++] = this.faces[t[0]].point_normals[t[1]][2]);
            }
            if (m.colors && c) {
                d = m.colors.length;
                h.vbo_colors = new Float32Array(d * 3);
                for (g = n = 0; g < d; g++)
                    (t = m.colors[g]), (h.vbo_colors[n++] = this.faces[t[0]].point_colors[t[1]][0]), (h.vbo_colors[n++] = this.faces[t[0]].point_colors[t[1]][1]), (h.vbo_colors[n++] = this.faces[t[0]].point_colors[t[1]][2]);
            }
            if (m.uvs && b) {
                d = m.uvs.length;
                h.vbo_uvs = new Float32Array(d * 2);
                for (g = n = 0; g < d; g++) (t = m.uvs[g]), (h.vbo_uvs[n++] = this.faces[t[0]].uvs[t[1]][0]), (h.vbo_uvs[n++] = this.faces[t[0]].uvs[t[1]][1]);
            }
            if (e) {
                h.elements_ref = [];
                h.vbo_elements = [];
                g = 0;
                for (d = m.elements.length; g < d; g++) {
                    h.elements_ref[g] = [];
                    var b = 0,
                        s;
                    for (s in m.elements[g])
                        if (m.elements[g].hasOwnProperty(s)) {
                            c = m.elements[g][s];
                            e = 0;
                            for (a = c.length; e < a; e++) h.vbo_elements.push(c[e]);
                            h.elements_ref[g][b] = [s | 0, c.length | 0];
                            b++;
                        }
                }
                h.vbo_elements = new Uint16Array(h.vbo_elements);
            }
            h.segments = m.segments;
            h.bounds = m.bounds;
            return h;
        },
        bufferVBO: function (m, e) {
            var g = q.gl,
                a = {};
            e === o && (e = {});
            a.gl_points = g.createBuffer();
            g.bindBuffer(g.ARRAY_BUFFER, a.gl_points);
            g.bufferData(g.ARRAY_BUFFER, m.vbo_points, g.STATIC_DRAW);
            m.vbo_normals ? ((a.gl_normals = g.createBuffer()), g.bindBuffer(g.ARRAY_BUFFER, a.gl_normals), g.bufferData(g.ARRAY_BUFFER, m.vbo_normals, g.STATIC_DRAW)) : (a.gl_normals = e.gl_normals ? e.gl_normals : null);
            m.vbo_uvs ? ((a.gl_uvs = g.createBuffer()), g.bindBuffer(g.ARRAY_BUFFER, a.gl_uvs), g.bufferData(g.ARRAY_BUFFER, m.vbo_uvs, g.STATIC_DRAW)) : (a.gl_uvs = e.gl_uvs ? e.gl_uvs : null);
            m.vbo_colors ? ((a.gl_colors = g.createBuffer()), g.bindBuffer(g.ARRAY_BUFFER, a.gl_colors), g.bufferData(g.ARRAY_BUFFER, m.vbo_colors, g.STATIC_DRAW)) : (a.gl_colors = e.gl_colors ? e.gl_colors : null);
            !m.vbo_elements && e.gl_elements
                ? ((a.gl_elements = e.gl_elements), (a.elements_ref = e.elements_ref))
                : ((a.gl_elements = g.createBuffer()), g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, a.gl_elements), g.bufferData(g.ELEMENT_ARRAY_BUFFER, m.vbo_elements, g.STATIC_DRAW), (a.elements_ref = m.elements_ref));
            a.segments = m.segments;
            a.bounds = m.bounds;
            e.elements_ref && !m.elements_ref && g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, null);
            return a;
        },
        bindBuffer: function (m) {
            if (this.originBuffer === null) this.originBuffer = m;
            this.compiled = m;
            this.segment_state = [];
            for (var e = 0, g = m.segments.length; e < g; e++) this.segment_state[m.segments[e]] = !0;
            this.bb = m.bounds;
        },
        compile: function (m) {
            this.bindBuffer(this.bufferVBO(this.compileVBO(this.compileMap(m))));
            return this;
        },
        addMorphTarget: function (m) {
            if (this.morphTargets === null) this.morphTargets = [];
            this.morphTargets.push(m);
        },
        setMorphSource: function (m) {
            if (this.morphSourceIndex !== m) (this.morphSourceIndex = m), this.bindBuffer(this.morphTargets[m]);
        },
        setMorphTarget: function (m) {
            if (this.morphTargetIndex !== m) (this.morphTargetIndex = m), (this.morphTarget = this.morphTargets[m]);
        },
        setMorphWeight: function (m) {
            this.morphWeight = m;
        },
        morphTargetCount: function () {
            return this.morphTargets !== null ? this.morphTargets.length : 0;
        },
    };
    return { Mesh: r, Face: x };
});
CubicVR.RegisterModule("Motion", function (u) {
    function x() {
        this.time = this.value = 0;
        this.shape = m.envelope.shape.TCB;
        this.bias = this.continuity = this.tension = 0;
        this.next = this.prev = null;
        this.param = [0, 0, 0, 0];
    }
    function r(a) {
        this.nKeys = 0;
        this.lastKey = this.firstKey = this.keys = null;
        a
            ? ((this.in_behavior = a.in_behavior ? a.in_behavior : m.envelope.behavior.CONSTANT), (this.out_behavior = a.out_behavior ? a.out_behavior : m.envelope.behavior.CONSTANT))
            : (this.out_behavior = this.in_behavior = m.envelope.behavior.CONSTANT);
    }
    function o(a, d) {
        this.env_init = a;
        this.key_init = d;
        this.controllers = [];
        this.yzflip = !1;
    }
    var q = u.undef,
        m = CubicVR.enums;
    m.motion = { POS: 0, ROT: 1, SCL: 2, FOV: 3, LENS: 4, NEARCLIP: 5, FARCLIP: 6, INTENSITY: 7, X: 0, Y: 1, Z: 2, V: 3 };
    m.envelope = { shape: { TCB: 0, HERM: 1, BEZI: 2, LINE: 3, STEP: 4, BEZ2: 5 }, behavior: { RESET: 0, CONSTANT: 1, REPEAT: 2, OSCILLATE: 3, OFFSET: 4, LINEAR: 5 } };
    var e = function (a, d, b) {
            var c = 0,
                c = b - d;
            if (c === 0) return [d, 0];
            d = a - c * Math.floor((a - d) / c);
            c = -parseInt((d - a) / c + (d > a ? 0.5 : -0.5), 10);
            return [d, c];
        },
        g = function (a, d, b, c, e) {
            var g, m;
            m = e * e;
            g = 3 * (d - a);
            d = 3 * (b - d) - g;
            return (c - a - g - d) * m * e + d * m + g * e + a;
        },
        a = function (b, d, n, c, e, m, q) {
            var o, v;
            v = m + (q - m) * 0.5;
            o = g(b, d, n, c, v);
            return Math.abs(e - o) > 1.0e-4 ? (o > e ? (q = v) : (m = v), a(b, d, n, c, e, m, q)) : v;
        },
        b = function (a, d) {
            var b, c, e, g;
            a.shape === m.envelope.shape.TCB
                ? ((b = (1 - a.tension) * (1 + a.continuity) * (1 + a.bias)),
                  (c = (1 - a.tension) * (1 - a.continuity) * (1 - a.bias)),
                  (e = d.value - a.value),
                  a.prev ? ((g = (d.time - a.time) / (d.time - a.prev.time)), (b = g * (b * (a.value - a.prev.value) + c * e))) : (b = c * e))
                : a.shape === m.envelope.shape.LINE
                ? ((e = d.value - a.value), a.prev ? ((g = (d.time - a.time) / (d.time - a.prev.time)), (b = g * (a.value - a.prev.value + e))) : (b = e))
                : a.shape === m.envelope.shape.BEZI || a.shape === m.envelope.shape.HERM
                ? ((b = a.param[1]), a.prev && (b *= (d.time - a.time) / (d.time - a.prev.time)))
                : a.shape === m.envelope.shape.BEZ2
                ? ((b = a.param[3] * (d.time - a.time)), Math.abs(a.param[2]) > 1.0e-5 ? (b /= a.param[2]) : (b *= 1e5))
                : (b = 0);
            return b;
        },
        c = function (a, d) {
            var b, c, e, g;
            d.shape === m.envelope.shape.LINE
                ? ((e = d.value - a.value), d.next ? ((g = (d.time - a.time) / (d.next.time - a.time)), (b = g * (d.next.value - d.value + e))) : (b = e))
                : d.shape === m.envelope.shape.TCB
                ? ((b = (1 - d.tension) * (1 - d.continuity) * (1 + d.bias)),
                  (c = (1 - d.tension) * (1 + d.continuity) * (1 - d.bias)),
                  (e = d.value - a.value),
                  d.next ? ((g = (d.time - a.time) / (d.next.time - a.time)), (b = g * (c * (d.next.value - d.value) + b * e))) : (b *= e))
                : d.shape === m.envelope.shape.HERM || d.shape === m.envelope.shape.BEZI
                ? ((b = d.param[0]), d.next && (b *= (d.time - a.time) / (d.next.time - a.time)))
                : d.shape === m.envelope.shape.BEZ2
                ? ((b = d.param[1] * (d.time - a.time)), Math.abs(d.param[0]) > 1.0e-5 ? (b /= d.param[0]) : (b *= 1e5))
                : (b = 0);
            return b;
        };
    r.prototype = {
        setBehavior: function (a, d) {
            this.in_behavior = a;
            this.out_behavior = d;
        },
        empty: function () {
            return this.nKeys === 0;
        },
        addKey: function (a, d, b) {
            var c = typeof a == "object" ? a : b;
            d || (d = 0);
            a || (a = 0);
            c
                ? ((c = a),
                  (a = c.time),
                  (b = this.insertKey(a)),
                  (b.value = c.value ? c.value : d),
                  (b.time = c.time ? c.time : a),
                  (b.shape = c.shape ? c.shape : m.envelope.shape.TCB),
                  (b.tension = c.tension ? c.tension : 0),
                  (b.continuity = c.continuity ? c.continuity : 0),
                  (b.bias = c.bias ? c.bias : 0),
                  (b.param = c.param ? c.param : [0, 0, 0, 0]))
                : ((b = this.insertKey(a)), (b.value = d));
            return b;
        },
        insertKey: function (a) {
            var d = new x();
            d.time = a;
            if (!this.nKeys) return (this.lastKey = this.firstKey = this.keys = d), this.nKeys++, d;
            for (var b = this.keys; b; ) {
                if (this.firstKey.time > a) this.firstKey = d;
                else if (this.lastKey.time < a) this.lastKey = d;
                if (b.time > d.time) {
                    d.prev = b.prev;
                    if (d.prev) d.prev.next = d;
                    d.next = b;
                    d.next.prev = d;
                    this.nKeys++;
                    return d;
                } else if (!b.next) return (d.prev = b), (b.next = d), this.nKeys++, d;
                b = b.next;
            }
            return null;
        },
        evaluate: function (h) {
            var d,
                n,
                t,
                s,
                q,
                o = 0;
            if (this.nKeys === 0) return 0;
            if (this.nKeys === 1) return this.keys.value;
            n = this.firstKey;
            d = this.lastKey;
            if (h < n.time)
                if (((s = this.in_behavior), s === m.envelope.behavior.RESET)) return 0;
                else if (s === m.envelope.behavior.CONSTANT) return n.value;
                else if (s === m.envelope.behavior.REPEAT) (s = e(h, n.time, d.time)), (h = s[0]);
                else if (s === m.envelope.behavior.OCILLATE) (s = e(h, n.time, d.time)), (h = s[0]), (s = s[1]), s % 2 && (h = d.time - n.time - h);
                else if (s === m.envelope.behavior.OFFSET) (s = e(h, n.time, d.time)), (h = s[0]), (s = s[1]), (o = s * (d.value - n.value));
                else {
                    if (s === m.envelope.behavior.LINEAR) return (q = b(n, n.next) / (n.next.time - n.time)), q * (h - n.time) + n.value;
                }
            else if (h > d.time)
                if (((s = this.out_behavior), s === m.envelope.behavior.RESET)) return 0;
                else if (s === m.envelope.behavior.CONSTANT) return d.value;
                else if (s === m.envelope.behavior.REPEAT) (s = e(h, n.time, d.time)), (h = s[0]);
                else if (s === m.envelope.behavior.OCILLATE) (s = e(h, n.time, d.time)), (h = s[0]), (s = s[1]), s % 2 && (h = d.time - n.time - h);
                else if (s === m.envelope.behavior.OFFSET) (s = e(h, n.time, d.time)), (h = s[0]), (s = s[1]), (o = s * (d.value - n.value));
                else if (s === m.envelope.behavior.LINEAR) return (s = c(d.prev, d) / (d.time - d.prev.time)), s * (h - d.time) + d.value;
            if (this.lastKey0)
                if (h > this.lastKey0.time) d = this.lastKey0;
                else if (h < this.lastKey0.time) for (d = this.lastKey; h < d.time && d.prev; ) d = d.prev;
                else d = this.keys;
            else d = this.keys;
            for (; h > d.next.time; ) d = d.next;
            n = d.next;
            this.lastKey0 = d;
            if (h === d.time) return d.value + o;
            else if (h === n.time) return n.value + o;
            t = (h - d.time) / (n.time - d.time);
            s = n.shape;
            if (s === m.envelope.shape.TCB || s === m.envelope.shape.BEZI || s === m.envelope.shape.HERM) {
                q = b(d, n);
                s = c(d, n);
                var r, v;
                v = t * t;
                r = t * v;
                h = 3 * v - r - r;
                r -= v;
                h = [1 - h, h, r - v + t, r];
                return h[0] * d.value + h[1] * n.value + h[2] * q + h[3] * s + o;
            } else
                return (
                    s === m.envelope.shape.BEZ2
                        ? ((h = a(d.time, d.shape === m.envelope.shape.BEZ2 ? d.time + d.param[2] : d.time + (n.time - d.time) / 3, n.time + n.param[0], n.time, h, 0, 1)),
                          (o = g(d.value, d.shape === m.envelope.shape.BEZ2 ? d.value + d.param[3] : d.value + d.param[1] / 3, n.param[1] + n.value, n.value, h) + o))
                        : (o = s === m.envelope.shape.LINE ? d.value + t * (n.value - d.value) + o : s === m.envelope.shape.STEP ? d.value + o : o),
                    o
                );
        },
    };
    o.prototype = {
        envelope: function (a, d) {
            this.controllers[a] === q && (this.controllers[a] = []);
            this.controllers[a][d] === q && (this.controllers[a][d] = new r(this.env_init));
            return this.controllers[a][d];
        },
        evaluate: function (a) {
            var d = [],
                b;
            for (b in this.controllers)
                if (this.controllers.hasOwnProperty(b)) {
                    d[b] = [];
                    for (var c in this.controllers[b]) this.controllers[b].hasOwnProperty(c) && (d[b][c] = this.controllers[b][c].evaluate(a));
                }
            return d;
        },
        apply: function (a, d) {
            for (var b in this.controllers)
                if (this.controllers.hasOwnProperty(b)) {
                    var c = parseInt(b, 10);
                    if (this.yzflip && c === m.motion.ROT) {
                        if (!this.q) this.q = new CubicVR.Quaternion();
                        var e = this.q,
                            g = this.controllers[b][0].evaluate(a),
                            q = this.controllers[b][1].evaluate(a),
                            o = this.controllers[b][2].evaluate(a);
                        e.fromEuler(g, o, -q);
                        e = e.toEuler();
                        d.control(c, 0, e[0]);
                        d.control(c, 1, e[1]);
                        d.control(c, 2, e[2]);
                    } else for (var v in this.controllers[b]) this.controllers[b].hasOwnProperty(v) && d.control(c, parseInt(v, 10), this.controllers[b][v].evaluate(a));
                }
        },
        setKey: function (a, d, b, c, e) {
            return this.envelope(a, d).addKey(b, c, e ? e : this.key_init);
        },
        setArray: function (a, d, b, c) {
            var e = [],
                g;
            for (g in b)
                if (b.hasOwnProperty(g)) {
                    var m = this.envelope(a, g);
                    e[g] = m.addKey(d, b[g], c ? c : this.key_init);
                }
            return e;
        },
        setBehavior: function (a, d, b, c) {
            this.envelope(a, d).setBehavior(b, c);
        },
        setBehaviorArray: function (a, d, b) {
            for (var c in this.controllers[a]) this.controllers[a].hasOwnProperty(c) && this.envelope(a, c).setBehavior(d, b);
        },
    };
    return { Motion: o, Envelope: r, EnvelopeKey: x };
});
CubicVR.RegisterModule("Octree", function (u) {
    function x(a, c, h, d, n) {
        var e = (this._children = []);
        this._dirty = !1;
        e[0] = null;
        e[1] = null;
        e[2] = null;
        e[3] = null;
        e[4] = null;
        e[5] = null;
        e[6] = null;
        e[7] = null;
        this._child_index = n || -1;
        this._root = h || null;
        this._max_depth = c || 0;
        a = this._size = a || 0;
        d = this._position = d || [0, 0, 0];
        this._nodes = [];
        this._lights = [];
        this._static_lights = [];
        this._sphere = [d[0], d[1], d[2], Math.sqrt(3 * (((this._size / 2) * this._size) / 2))];
        c = this._bbox = [
            [0, 0, 0],
            [0, 0, 0],
        ];
        h = CubicVR.aabb;
        h.reset(c, d);
        a /= 2;
        h.engulf(c, [d[0] + a, d[1] + a, d[2] + a]);
        h.engulf(c, [d[0] - a, d[1] - a, d[2] - a]);
        this._debug_visible = !1;
    }
    function r() {
        this.position = [0, 0, 0];
        this.visible = !1;
        this._object = null;
    }
    function o() {
        this.last_in = [];
        this._planes = [];
        this.sphere = null;
        for (var a = 0; a < 6; ++a) this._planes[a] = [0, 0, 0, 0];
    }
    var q = u.undef,
        m = CubicVR.plane,
        e = CubicVR.sphere,
        g = CubicVR.enums;
    g.frustum = { plane: { LEFT: 0, RIGHT: 1, TOP: 2, BOTTOM: 3, NEAR: 4, FAR: 5 } };
    g.octree = { TOP_NW: 0, TOP_NE: 1, TOP_SE: 2, TOP_SW: 3, BOTTOM_NW: 4, BOTTOM_NE: 5, BOTTOM_SE: 6, BOTTOM_SW: 7 };
    var a = function (a, c, h) {
        h = a.slice((h || c) + 1 || a.length);
        a.length = c < 0 ? a.length + c : c;
        return a.push.apply(a, h);
    };
    x.prototype.destroy = function () {
        var a, c, h;
        a = 0;
        for (c = this._static_lights.length; a < c; ++a) (h = this._static_lights[a]), (h.octree_leaves = null), (h.octree_common_root = null), (h.octree_aabb = null);
        a = 0;
        for (c = this._lights.length; a < c; ++a) (h = this._lights[a]), (h.octree_leaves = null), (h.octree_common_root = null), (h.octree_aabb = null);
        this._lights = this._static_lights = null;
        a = 0;
        for (c = this._children.length; a < c; ++a) this._children[a] !== null && this._children[a].destroy();
        a = 0;
        for (c = this._nodes.length; a < c; ++a) (h = this._nodes[a]), (h.octree_leaves = null), (h.octree_common_root = null), (h.octree_aabb = null), (h.dynamic_lights = []), (h.static_lights = []);
        this._children[0] = null;
        this._children[1] = null;
        this._children[2] = null;
        this._children[3] = null;
        this._children[4] = null;
        this._children[5] = null;
        this._children[6] = null;
        this._bbox = this._sphere = this._static_lights = this._lights = this._nodes = this._position = this._root = this._children = this._children[7] = null;
    };
    x.prototype.toString = function () {
        return (
            "[Octree: @" + this._position + ", depth: " + this._max_depth + ", size: " + this._size + ", nodes: " + this._nodes.length + ", measured size:" + [this._bbox[1][0] - this._bbox[0][0], this._bbox[1][2] - this._bbox[0][2]] + "]"
        );
    };
    x.prototype.remove = function (b) {
        var c = !1,
            h = this._nodes.length,
            d;
        d = h - 1;
        for (h = this._nodes.length; d >= 0; --d)
            if (b === this._nodes[d]) {
                a(this._nodes, d);
                this.dirty_lineage();
                c = !0;
                break;
            }
        if (!c)
            for (d = h - 1; d >= 0; --d)
                if (b === this._lights[d]) {
                    a(this._lights, d);
                    this.dirty_lineage();
                    break;
                }
    };
    x.prototype.dirty_lineage = function () {
        this._dirty = !0;
        this._root !== null && this._root.dirty_lineage();
    };
    x.prototype.cleanup = function () {
        for (var a = this._children.length, c = 0, h = 0; h < a; ++h) {
            var d = this._children[h];
            if (d !== null) {
                var n = !0;
                d._dirty === !0 && (n = d.cleanup());
                n ? ++c : (this._children[h] = null);
            }
        }
        if (this._nodes.length === 0 && this._static_lights.length === 0 && this._lights.length === 0 && (c === 0 || a === 0)) return !1;
        return !0;
    };
    x.prototype.insert_light = function (a) {
        this.insert(a, !0);
    };
    x.prototype.propagate_static_light = function (a) {
        var c, h;
        c = 0;
        for (h = this._nodes.length; c < h; ++c) this._nodes[c].static_lights.indexOf(a) === -1 && this._nodes[c].static_lights.push(a);
        for (c = 0; c < 8; ++c) this._children[c] !== null && this._children[c].propagate_static_light(a);
    };
    x.prototype.collect_static_lights = function (a) {
        var c, h;
        c = 0;
        for (h = this._static_lights.length; c < h; ++c) a.static_lights.indexOf(this._static_lights[c]) === -1 && a.static_lights.push(this._static_lights[c]);
        for (c = 0; c < 8; ++c) this._children[c] !== null && this._children[c].collect_static_lights(a);
    };
    x.prototype.insert = function (a, c) {
        function h(a, d, b, n) {
            var c, h;
            if (b)
                if (d.method === g.light.method.STATIC) {
                    a._static_lights.indexOf(d) === -1 && a._static_lights.push(d);
                    b = 0;
                    for (c = a._nodes.length; b < c; ++b) a._nodes[b].static_lights.indexOf(d) === -1 && a._nodes[b].static_lights.push(d);
                    for (h = a._root; h !== null; ) {
                        b = 0;
                        for (l = h._nodes.length; b < l; ++b) (c = h._nodes[b]), c.static_lights.indexOf(d) === -1 && c.static_lights.push(d);
                        h = h._root;
                    }
                } else a._lights.indexOf(d) === -1 && a._lights.push(d);
            else {
                a._nodes.push(d);
                b = 0;
                for (c = a._static_lights.length; b < c; ++b) d.static_lights.indexOf(a._static_lights[b]) === -1 && d.static_lights.push(a._static_lights[b]);
                for (h = a._root; h !== null; ) {
                    b = 0;
                    for (c = h._static_lights.length; b < c; ++b) {
                        var e = h._static_lights[b];
                        d.static_lights.indexOf(e) === -1 && d.static_lights.push(e);
                    }
                    h = h._root;
                }
            }
            d.octree_leaves.push(a);
            d.octree_common_root = n;
            n = CubicVR.aabb;
            n.engulf(d.octree_aabb, a._bbox[0]);
            n.engulf(d.octree_aabb, a._bbox[1]);
        }
        c === q && (c = !1);
        if (this._root === null) (a.octree_leaves = []), (a.octree_common_root = null);
        if (this._max_depth === 0) h(this, a, c, this._root);
        else {
            var d = this._position,
                n,
                e,
                s,
                m,
                o,
                r,
                v;
            e = a.getAABB();
            v = [e[0][0], e[0][1], e[0][2]];
            var D = [e[1][0], e[1][1], e[1][2]];
            n = v[0] < d[0] && v[1] < d[1] && v[2] < d[2];
            e = D[0] > d[0] && v[1] < d[1] && v[2] < d[2];
            o = v[0] < d[0] && D[1] > d[1] && v[2] < d[2];
            r = D[0] > d[0] && D[1] > d[1] && v[2] < d[2];
            s = v[0] < d[0] && v[1] < d[1] && D[2] > d[2];
            m = D[0] > d[0] && v[1] < d[1] && D[2] > d[2];
            v = v[0] < d[0] && D[1] > d[1] && D[2] > d[2];
            d = D[0] > d[0] && D[1] > d[1] && D[2] > d[2];
            if (n && e && o && r && s && m && v && d) h(this, a, c, this), c ? a.method == g.light.method.STATIC && this.propagate_static_light(a) : this.collect_static_lights(a);
            else {
                for (var D = 0, z = this._static_lights.length; D < z; ++D) {
                    if (a.static_lights === q) a.static_lights = [];
                    a.static_lights.indexOf(this._static_lights[D]) === -1 && a.static_lights.push(this._static_lights[D]);
                }
                var D = this._size / 2,
                    z = this._size / 4,
                    A = 0,
                    w = this._position[0],
                    y = this._position[1],
                    u = this._position[2];
                n && ((n = [w - z, y - z, u - z]), this._children[g.octree.TOP_NW] === null && (this._children[g.octree.TOP_NW] = new x(D, this._max_depth - 1, this, n, g.octree.TOP_NW)), this._children[g.octree.TOP_NW].insert(a, c), ++A);
                e && ((n = [w + z, y - z, u - z]), this._children[g.octree.TOP_NE] === null && (this._children[g.octree.TOP_NE] = new x(D, this._max_depth - 1, this, n, g.octree.TOP_NE)), this._children[g.octree.TOP_NE].insert(a, c), ++A);
                o &&
                    ((n = [w - z, y + z, u - z]),
                    this._children[g.octree.BOTTOM_NW] === null && (this._children[g.octree.BOTTOM_NW] = new x(D, this._max_depth - 1, this, n, g.octree.BOTTOM_NW)),
                    this._children[g.octree.BOTTOM_NW].insert(a, c),
                    ++A);
                r &&
                    ((n = [w + z, y + z, u - z]),
                    this._children[g.octree.BOTTOM_NE] === null && (this._children[g.octree.BOTTOM_NE] = new x(D, this._max_depth - 1, this, n, g.octree.BOTTOM_NE)),
                    this._children[g.octree.BOTTOM_NE].insert(a, c),
                    ++A);
                s && ((n = [w - z, y - z, u + z]), this._children[g.octree.TOP_SW] === null && (this._children[g.octree.TOP_SW] = new x(D, this._max_depth - 1, this, n, g.octree.TOP_SW)), this._children[g.octree.TOP_SW].insert(a, c), ++A);
                m && ((n = [w + z, y - z, u + z]), this._children[g.octree.TOP_SE] === null && (this._children[g.octree.TOP_SE] = new x(D, this._max_depth - 1, this, n, g.octree.TOP_SE)), this._children[g.octree.TOP_SE].insert(a, c), ++A);
                v &&
                    ((n = [w - z, y + z, u + z]),
                    this._children[g.octree.BOTTOM_SW] === null && (this._children[g.octree.BOTTOM_SW] = new x(D, this._max_depth - 1, this, n, g.octree.BOTTOM_SW)),
                    this._children[g.octree.BOTTOM_SW].insert(a, c),
                    ++A);
                d &&
                    ((n = [w + z, y + z, u + z]),
                    this._children[g.octree.BOTTOM_SE] === null && (this._children[g.octree.BOTTOM_SE] = new x(D, this._max_depth - 1, this, n, g.octree.BOTTOM_SE)),
                    this._children[g.octree.BOTTOM_SE].insert(a, c),
                    ++A);
                if (A > 1 || a.octree_common_root === null) a.octree_common_root = this;
            }
        }
    };
    x.prototype.draw_on_map = function (a, c, h) {
        function d(a, d, b, h, s) {
            var g = a < b ? a : b,
                m = d < h ? d : h,
                a = a < b ? b - a : a - b,
                d = d < h ? h - d : d - h;
            c.save();
            if (s !== void 0) (c.fillStyle = s), c.fillRect(n + g, e + m, a, d);
            c.strokeRect(n + g, e + m, a, d);
            c.restore();
        }
        var n = a.width / 2,
            e = a.height / 2,
            s,
            g,
            m,
            o,
            v,
            r,
            z;
        if (h === q || h === "map")
            c.save(),
                this._debug_visible !== !1 ? ((c.fillStyle = "rgba(0,0,0,0)"), (c.strokeStyle = "#FF0000")) : ((c.fillStyle = "rgba(0,0,0,0)"), (c.strokeStyle = "rgba(0,0,0,0)")),
                c.beginPath(),
                (v = this._size / 2),
                (s = this._position[0]),
                (g = this._position[2]),
                c.moveTo(n + s - v, n + g - v),
                c.lineTo(n + s - v, n + g + v),
                c.lineTo(n + s + v, n + g + v),
                c.lineTo(n + s + v, n + g - v),
                c.stroke(),
                c.fill(),
                c.restore();
        if (h === q || h === "objects") {
            c.save();
            v = 0;
            for (z = this._nodes.length; v < z; ++v)
                (r = this._nodes[v]),
                    (c.fillStyle = "#5500FF"),
                    (c.strokeStyle = r.visible === !0 && r.culled === !1 ? "#FFFFFF" : "#000000"),
                    c.beginPath(),
                    (s = r.aabb[0][0]),
                    (g = r.aabb[0][2]),
                    (m = r.aabb[1][0] - s),
                    (o = r.aabb[1][2] - g),
                    c.rect(n + s, e + g, m, o),
                    c.stroke();
            c.restore();
        }
        if (h === q || h === "lights") {
            v = 0;
            for (z = this._lights.length; v < z; ++v)
                (o = this._lights[v]),
                    (c.fillStyle = o.culled === !1 && o.visible === !0 ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.0)"),
                    (c.strokeStyle = "#FFFF00"),
                    c.beginPath(),
                    (r = o.distance),
                    (s = o.position[0]),
                    (g = o.position[2]),
                    c.arc(n + s, e + g, r, 0, Math.PI * 2, !0),
                    c.closePath(),
                    c.stroke(),
                    c.fill(),
                    c.beginPath(),
                    (s = o.aabb[0][0]),
                    (g = o.aabb[0][2]),
                    (m = o.aabb[1][0] - s),
                    (o = o.aabb[1][2] - g),
                    c.rect(n + s, e + g, m, o),
                    c.closePath(),
                    c.stroke();
            v = 0;
            for (z = this._static_lights.length; v < z; ++v)
                (o = this._static_lights[v]),
                    (c.fillStyle = o.culled === !1 && o.visible === !0 ? "rgba(255, 255, 255, 0.01)" : "rgba(255, 255, 255, 0.0)"),
                    (c.strokeStyle = "#FF66BB"),
                    c.beginPath(),
                    (r = o.distance),
                    (s = o.position[0]),
                    (g = o.position[2]),
                    c.arc(n + s, e + g, r, 0, Math.PI * 2, !0),
                    c.closePath(),
                    c.stroke(),
                    c.fill(),
                    c.beginPath(),
                    (s = o.aabb[0][0]),
                    (g = o.aabb[0][2]),
                    (m = o.aabb[1][0] - s),
                    (o = o.aabb[1][2] - g),
                    c.rect(n + s, e + g, m, o),
                    c.closePath(),
                    c.stroke();
        }
        if (h != "lights" && h != "objects" && h != "map") {
            c.save();
            s = this._nodes;
            v = 0;
            for (o = s.length; v < o; ++v)
                if (((r = s[v]), r.name == h)) {
                    c.strokeStyle = "#FFFF00";
                    c.lineWidth = 3;
                    c.beginPath();
                    s = r.aabb[0][0];
                    g = r.aabb[0][2];
                    m = r.aabb[1][0] - s;
                    o = r.aabb[1][2] - g;
                    c.rect(n + s, e + g, m, o);
                    c.closePath();
                    c.stroke();
                    s = r.octree_aabb;
                    c.strokeStyle = "#0000FF";
                    d(s[0][0], s[0][2], s[1][0], s[1][2]);
                    c.lineWidth = 1;
                    if (r.common_root !== null) c.strokeStyle = "#00FF00";
                    break;
                }
            c.lineWidth = 1;
            c.strokeStyle = "#FFFF00";
            d(this._bbox[0][0], this._bbox[0][2], this._bbox[1][0], this._bbox[1][2], "#444444");
            c.fill();
            c.restore();
        }
        v = 0;
        for (z = this._children.length; v < z; ++v) this._children[v] !== null && this._children[v].draw_on_map(a, c, h);
    };
    x.prototype.contains_point = function (a) {
        return (
            a[0] <= this._position[0] + this._size / 2 &&
            a[1] <= this._position[1] + this._size / 2 &&
            a[2] <= this._position[2] + this._size / 2 &&
            a[0] >= this._position[0] - this._size / 2 &&
            a[1] >= this._position[1] - this._size / 2 &&
            a[2] >= this._position[2] - this._size / 2
        );
    };
    x.prototype.get_frustum_hits = function (a, c) {
        var h = { objects: [], lights: [] };
        if ((c === q || c === !0) && !this.contains_point(a.position)) {
            if (e.intersects(a.frustum.sphere, this._sphere) === !1) return h;
            var d = a.frustum.contains_sphere(this._sphere);
            if (d === -1) return (this._debug_visible = !1), h;
            else if (d === 1) (this._debug_visible = 2), (c = !1);
            else if (d === 0)
                if (((this._debug_visible = !0), (d = a.frustum.contains_box(this._bbox)), d === -1)) return (this._debug_visible = !1), h;
                else if (d === 1) (this._debug_visible = 3), (c = !1);
        }
        var n,
            t,
            d = 0;
        for (n = this._nodes.length; d < n; ++d) (t = this._nodes[d]), h.objects.push(t), (t.dynamic_lights = [].concat(this._lights)), (t.was_culled = t.culled), (t.culled = !1), (t.drawn_this_frame = !1);
        this._debug_visible = this._lights.length > 0 ? 4 : this._debug_visible;
        d = 0;
        for (n = this._lights.length; d < n; ++d) if (((t = this._lights[d]), t.visible === !0)) h.lights.push(t), (t.was_culled = t.culled), (t.culled = !1);
        d = 0;
        for (n = this._static_lights.length; d < n; ++d) if (((t = this._static_lights[d]), t.visible === !0)) t.culled = !1;
        for (d = 0; d < 8; ++d)
            if (this._children[d] !== null) {
                n = this._children[d].get_frustum_hits(a, c);
                var s;
                t = 0;
                for (s = n.objects.length; t < s; ++t) {
                    h.objects.push(n.objects[t]);
                    for (var g = n.objects[t].dynamic_lights, m = 0, o = this._lights.length; m < o; ++m) g.indexOf(this._lights[m]) < 0 && g.push(this._lights[m]);
                }
                t = 0;
                for (s = n.lights.length; t < s; ++t) h.lights.indexOf(n.lights[t]) < 0 && h.lights.push(n.lights[t]);
            }
        return h;
    };
    x.prototype.reset_node_visibility = function () {
        this._debug_visible = !1;
        var a, c;
        a = 0;
        for (c = this._nodes.length; a < c; ++a) this._nodes[a].culled = !0;
        a = 0;
        for (c = this._lights.length; a < c; ++a) this._lights[a].culled = !0;
        a = 0;
        for (c = this._static_lights.length; a < c; ++a) this._static_lights[a].culled = !0;
        a = 0;
        for (c = this._children.length; a < c; ++a) this._children[a] !== null && this._children[a].reset_node_visibility();
    };
    r.prototype.toString = function () {
        return "[OctreeNode " + this.position + "]";
    };
    r.prototype.attach = function (a) {
        this._object = a;
    };
    o.prototype.extract = function (a, c, h) {
        var d = CubicVR.vec3;
        if (!(c === q || h === q)) {
            var n = CubicVR.mat4.multiply(h, c),
                c = this._planes;
            c[g.frustum.plane.LEFT][0] = n[3] + n[0];
            c[g.frustum.plane.LEFT][1] = n[7] + n[4];
            c[g.frustum.plane.LEFT][2] = n[11] + n[8];
            c[g.frustum.plane.LEFT][3] = n[15] + n[12];
            c[g.frustum.plane.RIGHT][0] = n[3] - n[0];
            c[g.frustum.plane.RIGHT][1] = n[7] - n[4];
            c[g.frustum.plane.RIGHT][2] = n[11] - n[8];
            c[g.frustum.plane.RIGHT][3] = n[15] - n[12];
            c[g.frustum.plane.TOP][0] = n[3] - n[1];
            c[g.frustum.plane.TOP][1] = n[7] - n[5];
            c[g.frustum.plane.TOP][2] = n[11] - n[9];
            c[g.frustum.plane.TOP][3] = n[15] - n[13];
            c[g.frustum.plane.BOTTOM][0] = n[3] + n[1];
            c[g.frustum.plane.BOTTOM][1] = n[7] + n[5];
            c[g.frustum.plane.BOTTOM][2] = n[11] + n[9];
            c[g.frustum.plane.BOTTOM][3] = n[15] + n[13];
            c[g.frustum.plane.NEAR][0] = n[3] + n[2];
            c[g.frustum.plane.NEAR][1] = n[7] + n[6];
            c[g.frustum.plane.NEAR][2] = n[11] + n[10];
            c[g.frustum.plane.NEAR][3] = n[15] + n[14];
            c[g.frustum.plane.FAR][0] = n[3] - n[2];
            c[g.frustum.plane.FAR][1] = n[7] - n[6];
            c[g.frustum.plane.FAR][2] = n[11] - n[10];
            c[g.frustum.plane.FAR][3] = n[15] - n[14];
            for (var e = 0; e < 6; ++e) m.normalize(c[e]);
            e = -c[g.frustum.plane.NEAR][3];
            c = c[g.frustum.plane.FAR][3] - e;
            h = c * (1 / h[5]);
            h = d.subtract([0, 0, e + c * 0.5], [h, h, e + c]);
            h = d.length(h);
            n = [n[3], n[9], n[10]];
            e = d.length(n);
            n = d.multiply(n, 1 / e);
            a = [a.position[0], a.position[1], a.position[2]];
            a = d.add(a, d.multiply(n, c * 0.5));
            a = d.add(a, d.multiply(n, 1));
            this.sphere = [a[0], a[1], a[2], h];
        }
    };
    o.prototype.contains_sphere = function (a) {
        for (var c = CubicVR.vec3, h = this._planes, d = 0; d < 6; ++d) {
            var n = h[d],
                n = c.dot([n[0], n[1], n[2]], [a[0], a[1], a[2]]) + n.d;
            this.last_in[d] = 1;
            if (n < -a[3]) return -1;
            if (Math.abs(n) < a[3]) return 0;
        }
        return 1;
    };
    o.prototype.draw_on_map = function (a, c) {
        var h = a.width / 2,
            d = a.height / 2;
        c.save();
        for (var n = this._planes, e = [0, 1, 4, 5], s = 0, g = e.length; s < g; ++s) {
            var m = n[e[s]];
            c.strokeStyle = "#FF00FF";
            if (s < this.last_in.length && this.last_in[s]) c.strokeStyle = "#FFFF00";
            var o = -h,
                q = h,
                r = (-m[3] - m[0] * q) / m[2];
            c.moveTo(h + o, d + (-m[3] - m[0] * o) / m[2]);
            c.lineTo(h + q, d + r);
            c.stroke();
        }
        c.strokeStyle = "#0000FF";
        c.beginPath();
        c.arc(h + this.sphere[0], d + this.sphere[2], this.sphere[3], 0, Math.PI * 2, !1);
        c.closePath();
        c.stroke();
        c.restore();
    };
    o.prototype.contains_box = function (a) {
        var c = 0,
            e = [];
        e[0] = a[0];
        e[1] = [a[0][0], a[0][1], a[1][2]];
        e[2] = [a[0][0], a[1][1], a[0][2]];
        e[3] = [a[0][0], a[1][1], a[1][2]];
        e[4] = [a[1][0], a[0][1], a[0][2]];
        e[5] = [a[1][0], a[0][1], a[1][2]];
        e[6] = [a[1][0], a[1][1], a[0][2]];
        e[7] = a[1];
        for (var a = this._planes, d = 0; d < 6; ++d) {
            for (var n = 8, g = 1, s = 0; s < 8; ++s) m.classifyPoint(a[d], e[s]) === -1 && ((g = 0), --n);
            this.last_in[d] = g;
            if (n === 0) return -1;
            c += g;
        }
        if (c === 6) return 1;
        return 0;
    };
    return { Frustum: o, Octree: x };
});
CubicVR.RegisterModule("Particles", function (u) {
    function x(o, m, e, g, a, b, c) {
        if (o) {
            this.last_particle = this.particles = null;
            this.pTex = e !== r ? e : null;
            this.vWidth = g;
            this.vHeight = a;
            this.alpha = b !== r ? b : !1;
            this.alphaCut = c !== r ? c : 0;
            this.pfunc = function (a, d) {
                var b = d - a.start_time;
                if (b < 0) return 0;
                if (b > a.life_time && a.life_time) return -1;
                a.pos[0] = a.startpos[0] + b * a.velocity[0] + b * b * a.accel[0];
                a.pos[1] = a.startpos[1] + b * a.velocity[1] + b * b * a.accel[1];
                a.pos[2] = a.startpos[2] + b * a.velocity[2] + b * b * a.accel[2];
                this.pgov !== null && this.pgov(a, d);
                return 1;
            };
            this.pgov = null;
            this.hasColor = m === r ? !1 : m;
            e = this.pTex !== null;
            this.vs = [
                "#ifdef GL_ES\nprecision highp float;\n#endif\nattribute vec3 aVertexPosition;",
                this.hasColor ? "attribute vec3 aColor;" : "",
                "uniform mat4 uMVMatrix;\nuniform mat4 uPMatrix;\nvarying vec4 color;\nvarying vec2 screenPos;",
                e ? "varying float pSize;" : "",
                "void main(void) {\nvec4 position = uPMatrix * uMVMatrix * vec4(aVertexPosition,1.0);",
                e ? "screenPos=vec2(position.x/position.w,position.y/position.w);" : "",
                "gl_Position = position;",
                this.hasColor ? "color = vec4(aColor.r,aColor.g,aColor.b,1.0);" : "color = vec4(1.0,1.0,1.0,1.0);",
                e ? "pSize=200.0/position.z;" : "float pSize=200.0/position.z;",
                "gl_PointSize = pSize;\n}",
            ].join("\n");
            this.fs = [
                "#ifdef GL_ES\nprecision highp float;\n#endif",
                e ? "uniform sampler2D pMap;" : "",
                "varying vec4 color;",
                e ? "varying vec2 screenPos;" : "",
                e ? "uniform vec3 screenDim;" : "",
                e ? "varying float pSize;" : "",
                "void main(void) {\nvec4 c = color;",
                e ? "vec2 screen=vec2((gl_FragCoord.x/screenDim.x-0.5)*2.0,(gl_FragCoord.y/screenDim.y-0.5)*2.0);" : "",
                e ? "vec2 pointCoord=vec2( ((screen.x-screenPos.x)/(pSize/screenDim.x))/2.0+0.5,((screen.y-screenPos.y)/(pSize/screenDim.y))/2.0+0.5);" : "",
                e ? "vec4 tc = texture2D(pMap,pointCoord); gl_FragColor = vec4(c.rgb*tc.rgb,1.0);" : "gl_FragColor = c;",
                "}",
            ].join("\n");
            this.maxPoints = o;
            this.numParticles = 0;
            this.arPoints = new Float32Array(o * 3);
            this.glPoints = null;
            if (m) (this.arColor = new Float32Array(o * 3)), (this.glColor = null);
            this.shader_particle = new CubicVR.Shader(this.vs, this.fs);
            this.shader_particle.use();
            this.shader_particle.addVertexArray("aVertexPosition");
            this.hasColor && this.shader_particle.addVertexArray("aColor");
            this.shader_particle.addMatrix("uMVMatrix");
            this.shader_particle.addMatrix("uPMatrix");
            this.pTex !== null && (this.shader_particle.addInt("pMap", 0), this.shader_particle.addVector("screenDim"), this.shader_particle.setVector("screenDim", [g, a, 0]));
            this.genBuffer();
        }
    }
    var r = u.undef,
        o = u.GLCore;
    x.prototype = {
        resizeView: function (o, m) {
            this.vWidth = o;
            this.vHeight = m;
            this.pTex !== null && (this.shader_particle.addVector("screenDim"), this.shader_particle.setVector("screenDim", [o, m, 0]));
        },
        addParticle: function (o) {
            this.last_particle === null ? (this.particles = o) : (this.last_particle.nextParticle = o);
            this.last_particle = o;
        },
        genBuffer: function () {
            var q = o.gl;
            this.glPoints = q.createBuffer();
            q.bindBuffer(q.ARRAY_BUFFER, this.glPoints);
            q.bufferData(q.ARRAY_BUFFER, this.arPoints, q.DYNAMIC_DRAW);
            if (this.hasColor) (this.glColor = q.createBuffer()), q.bindBuffer(q.ARRAY_BUFFER, this.glColor), q.bufferData(q.ARRAY_BUFFER, this.arColor, q.DYNAMIC_DRAW);
        },
        updatePoints: function () {
            var q = o.gl;
            q.bindBuffer(q.ARRAY_BUFFER, this.glPoints);
            q.bufferData(q.ARRAY_BUFFER, this.arPoints, q.DYNAMIC_DRAW);
        },
        updateColors: function () {
            var q = o.gl;
            this.hasColor && (q.bindBuffer(q.ARRAY_BUFFER, this.glColor), q.bufferData(q.ARRAY_BUFFER, this.arColor, q.DYNAMIC_DRAW));
        },
        draw: function (q, m, e) {
            var g = o.gl;
            this.shader_particle.use();
            this.pTex !== null && this.pTex.use(g.TEXTURE0);
            this.shader_particle.setMatrix("uMVMatrix", q);
            this.shader_particle.setMatrix("uPMatrix", m);
            g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, null);
            g.bindBuffer(g.ARRAY_BUFFER, this.glPoints);
            g.vertexAttribPointer(this.shader_particle.uniforms.aVertexPosition, 3, g.FLOAT, !1, 0, 0);
            g.enableVertexAttribArray(this.shader_particle.uniforms.aVertexPosition);
            this.hasColor && (g.bindBuffer(g.ARRAY_BUFFER, this.glColor), g.vertexAttribPointer(this.shader_particle.uniforms.aColor, 3, g.FLOAT, !1, 0, 0), g.enableVertexAttribArray(this.shader_particle.uniforms.aColor));
            e === r && (e = 0);
            if (this.particles === null) g.disable(g.BLEND);
            else {
                for (var q = this.particles, m = null, a = (this.numParticles = 0); q !== null; ) {
                    var b = this.numParticles * 3,
                        c = this.pfunc(q, e);
                    if (c === 1) {
                        if (
                            ((this.arPoints[b] = q.pos[0]),
                            (this.arPoints[b + 1] = q.pos[1]),
                            (this.arPoints[b + 2] = q.pos[2]),
                            q.color !== null && this.arColor !== r && ((this.arColor[b] = q.color[0]), (this.arColor[b + 1] = q.color[1]), (this.arColor[b + 2] = q.color[2])),
                            this.numParticles++,
                            a++,
                            this.numParticles === this.maxPoints)
                        )
                            break;
                    } else if (c === -1) {
                        if (m !== null) m.nextParticle = q.nextParticle;
                    } else c === 0 && a++;
                    m = q;
                    q = q.nextParticle;
                }
                if (!a) this.last_particle = this.particles = null;
                this.updatePoints();
                this.hasColor && this.updateColors();
                this.alpha && (g.enable(g.BLEND), g.enable(g.DEPTH_TEST), g.depthMask(0), g.blendFunc(g.ONE, g.ONE_MINUS_SRC_COLOR));
                g.drawArrays(g.POINTS, 0, this.numParticles);
                this.alpha && (g.disable(g.BLEND), g.depthMask(1), g.blendFunc(g.ONE, g.ONE));
                this.hasColor && g.disableVertexAttribArray(this.shader_particle.uniforms.aColor);
            }
        },
    };
    return {
        ParticleSystem: x,
        Particle: function (o, m, e, g, a) {
            this.startpos = new Float32Array(o);
            this.pos = new Float32Array(o);
            this.velocity = new Float32Array(g !== r ? g : [0, 0, 0]);
            this.accel = new Float32Array(a !== r ? a : [0, 0, 0]);
            this.start_time = m !== r ? m : 0;
            this.life_time = e !== r ? e : 0;
            this.nextParticle = this.color = null;
        },
    };
});
CubicVR.RegisterModule("PostProcess", function (u) {
    function x(a) {
        if (a.shader_vertex === q) return null;
        if (a.shader_fragment === q) return null;
        this.outputMode = a.outputMode === q ? e.post.output.REPLACE : a.outputMode;
        this.onresize = a.onresize === q ? null : a.onresize;
        this.onupdate = a.onupdate === q ? null : a.onupdate;
        this.init = a.init === q ? null : a.init;
        this.enabled = a.enabled === q ? !0 : a.enabled;
        this.outputDivisor = a.outputDivisor === q ? 1 : a.outputDivisor;
        this.shader = new CubicVR.Shader(a.shader_vertex, a.shader_fragment);
        this.shader.use();
        this.shader.addUVArray("aTex");
        this.shader.addVertexArray("aVertex");
        this.shader.addInt("srcTex", 0);
        this.shader.addInt("captureTex", 1);
        this.shader.addVector("texel");
        this.init !== null && this.init(this.shader);
    }
    function r(a, c, e) {
        var d = m.gl;
        this.width = a;
        this.height = c;
        this.accum = e === q ? !1 : !0;
        this.vTexel = [1 / this.width, 1 / this.height, 0];
        this.captureBuffer = new CubicVR.RenderBuffer(a, c, !0);
        this.bufferA = new CubicVR.RenderBuffer(a, c, !1);
        this.bufferB = new CubicVR.RenderBuffer(a, c, !1);
        this.bufferC = new CubicVR.RenderBuffer(a, c, !1);
        this.accumOpacity = 1;
        this.accumIntensity = 0.3;
        if (this.accum)
            (this.accumBuffer = new CubicVR.RenderBuffer(a, c, !1)),
                this.accumBuffer.use(),
                d.clearColor(0, 0, 0, 1),
                d.clear(d.COLOR_BUFFER_BIT),
                (this.blur_shader = new x({
                    shader_vertex: "attribute vec3 aVertex;\nattribute vec2 aTex;\nvarying vec2 vTex;\nvoid main(void)\n{\nvTex = aTex;\nvec4 vPos = vec4(aVertex.xyz,1.0);\ngl_Position = vPos;\n}",
                    shader_fragment: "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D srcTex;\nvarying vec2 vTex;\nuniform float opacity;\nvoid main(void)\n{ gl_FragColor = vec4(texture2D(srcTex, vTex).rgb, opacity);\n}",
                    init: function (a) {
                        a.addFloat("opacity");
                        a.setFloat("opacity", 1);
                    },
                }));
        this.bufferA.use();
        d.clearColor(0, 0, 0, 1);
        d.clear(d.COLOR_BUFFER_BIT);
        this.bufferB.use();
        d.clearColor(0, 0, 0, 1);
        d.clear(d.COLOR_BUFFER_BIT);
        this.end();
        this.fsQuad = this.makeFSQuad(this.width, this.height);
        this.shaders = [];
        this.copy_shader = new x({
            shader_vertex: "attribute vec3 aVertex;\nattribute vec2 aTex;\nvarying vec2 vTex;\nvoid main(void) {\nvTex = aTex;\nvec4 vPos = vec4(aVertex.xyz,1.0);\ngl_Position = vPos;\n}",
            shader_fragment: "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D srcTex;\nvarying vec2 vTex;\nvoid main(void) {\ngl_FragColor = texture2D(srcTex, vTex);\n}",
        });
        this.resize(a, c);
    }
    function o(a, c, e) {
        this.createBuffer(a, c, e);
    }
    var q = u.undef,
        m = u.GLCore,
        e = CubicVR.enums;
    e.post = { output: { REPLACE: 0, BLEND: 1, ADD: 2, ALPHACUT: 3 } };
    var g = [],
        a = [];
    r.prototype = {
        setBlurOpacity: function (a) {
            this.accumOpacity = a;
        },
        setBlurIntensity: function (a) {
            this.accumIntensity = a;
        },
        makeFSQuad: function (a, c) {
            var e = m.gl,
                d = [],
                n = a / a,
                g = c / c;
            d.vbo_points = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0]);
            d.vbo_uvs = new Float32Array([0, 0, n, 0, n, g, 0, g, 0, 0, n, g]);
            d.gl_points = e.createBuffer();
            e.bindBuffer(e.ARRAY_BUFFER, d.gl_points);
            e.bufferData(e.ARRAY_BUFFER, d.vbo_points, e.STATIC_DRAW);
            d.gl_uvs = e.createBuffer();
            e.bindBuffer(e.ARRAY_BUFFER, d.gl_uvs);
            e.bufferData(e.ARRAY_BUFFER, d.vbo_uvs, e.STATIC_DRAW);
            return d;
        },
        destroyFSQuad: function (a) {
            var c = m.gl;
            c.deleteBuffer(a.gl_points);
            c.deleteBuffer(a.gl_uvs);
        },
        renderFSQuad: function (a, c) {
            var e = m.gl;
            a.use();
            e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, null);
            e.bindBuffer(e.ARRAY_BUFFER, c.gl_points);
            e.vertexAttribPointer(a.aVertex, 3, e.FLOAT, !1, 0, 0);
            e.enableVertexAttribArray(a.aVertex);
            e.bindBuffer(e.ARRAY_BUFFER, c.gl_uvs);
            e.vertexAttribPointer(a.aTex, 2, e.FLOAT, !1, 0, 0);
            e.enableVertexAttribArray(a.aTex);
            e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, null);
            e.drawArrays(e.TRIANGLES, 0, 6);
        },
        addShader: function (b) {
            this.shaders[this.shaders.length] = b;
            b.shader.use();
            b.shader.setVector("texel", this.vTexel);
            if (b.outputDivisor && b.outputDivisor != 1 && g[b.outputDivisor] === q) {
                var c = (this.width / b.outputDivisor) | 0,
                    e = (this.height / b.outputDivisor) | 0;
                g[b.outputDivisor] = new CubicVR.RenderBuffer(c, e, !1);
                a[b.outputDivisor] = this.makeFSQuad(c, e);
            }
        },
        resize: function (b, c) {
            var e = m.gl;
            this.width = b;
            this.height = c;
            this.vTexel = [1 / this.width, 1 / this.height, 0];
            this.captureBuffer.destroyBuffer();
            this.captureBuffer.createBuffer(this.width, this.height, !0);
            this.bufferA.destroyBuffer();
            this.bufferA.createBuffer(this.width, this.height, !1);
            this.bufferB.destroyBuffer();
            this.bufferB.createBuffer(this.width, this.height, !1);
            this.bufferC.destroyBuffer();
            this.bufferC.createBuffer(this.width, this.height, !1);
            this.accum && (this.accumBuffer.destroyBuffer(), this.accumBuffer.createBuffer(this.width, this.height, !1), this.accumBuffer.use(), e.clearColor(0, 0, 0, 1), e.clear(e.COLOR_BUFFER_BIT));
            for (var d in g) {
                var e = (this.width / d) | 0,
                    n = (this.height / d) | 0;
                g[d].destroyBuffer();
                g[d].createBuffer(e, n, !1);
                this.destroyFSQuad(a[d]);
                a[d] = this.makeFSQuad(e, n);
            }
            this.inputBuffer = this.bufferA;
            this.outputBuffer = this.bufferB;
            d = 0;
            for (e = this.shaders.length; d < e; d++)
                if ((this.shaders[d].shader.use(), this.shaders[d].shader.setVector("texel", this.vTexel), this.shaders[d].onresize !== null)) this.shaders[d].onresize(this.shaders[d].shader, this.width, this.height);
            this.destroyFSQuad(this.fsQuad);
            this.fsQuad = this.makeFSQuad(this.width, this.height);
        },
        swap: function () {
            var a = this.inputBuffer;
            this.inputBuffer = this.outputBuffer;
            this.outputBuffer = a;
        },
        begin: function () {
            this.captureBuffer.use();
        },
        end: function () {
            var a = m.gl;
            a.bindFramebuffer(a.FRAMEBUFFER, null);
        },
        render: function () {
            var b = m.gl;
            this.captureBuffer.texture.use(b.TEXTURE1);
            this.outputBuffer.use();
            this.captureBuffer.texture.use(b.TEXTURE0);
            b.clearColor(0, 0, 0, 1);
            b.clear(b.COLOR_BUFFER_BIT);
            this.renderFSQuad(this.copy_shader.shader, this.fsQuad);
            this.end();
            for (var c = 0, h = 0, d = this.shaders.length; h < d; h++) {
                var n = this.shaders[h];
                if (n.enabled) {
                    this.swap();
                    this.inputBuffer.texture.use(b.TEXTURE0);
                    var t = n.outputMode;
                    if (t === e.post.output.REPLACE) n.outputDivisor !== 1 ? g[n.outputDivisor].use() : this.outputBuffer.use(), b.clearColor(0, 0, 0, 1), b.clear(b.COLOR_BUFFER_BIT);
                    else if (t === e.post.output.ADD || t === e.post.output.BLEND) n.outputDivisor !== 1 ? g[n.outputDivisor].use() : this.bufferC.use(), b.clearColor(0, 0, 0, 1), b.clear(b.COLOR_BUFFER_BIT);
                    n.onupdate !== null && (n.shader.use(), n.onupdate(n.shader));
                    n.outputDivisor !== 1
                        ? (b.viewport(0, 0, g[n.outputDivisor].width, g[n.outputDivisor].height),
                          this.renderFSQuad(n.shader, a[n.outputDivisor]),
                          n.outputMode === e.post.output.REPLACE
                              ? (this.outputBuffer.use(), g[n.outputDivisor].texture.use(b.TEXTURE0), b.viewport(0, 0, this.width, this.height), this.renderFSQuad(this.copy_shader.shader, this.fsQuad))
                              : b.viewport(0, 0, this.width, this.height))
                        : this.renderFSQuad(n.shader, this.fsQuad);
                    t === e.post.output.BLEND
                        ? (this.swap(),
                          this.outputBuffer.use(),
                          b.enable(b.BLEND),
                          b.blendFunc(b.ONE, b.ONE_MINUS_SRC_ALPHA),
                          this.inputBuffer.texture.use(b.TEXTURE0),
                          n.outputDivisor !== 1 ? g[n.outputDivisor].texture.use(b.TEXTURE0) : this.bufferC.texture.use(b.TEXTURE0),
                          this.renderFSQuad(this.copy_shader.shader, this.fsQuad),
                          b.disable(b.BLEND))
                        : t === e.post.output.ADD &&
                          (this.swap(),
                          this.outputBuffer.use(),
                          b.enable(b.BLEND),
                          b.blendFunc(b.ONE, b.ONE),
                          n.outputDivisor !== 1 ? g[n.outputDivisor].texture.use(b.TEXTURE0) : this.bufferC.texture.use(b.TEXTURE0),
                          this.renderFSQuad(this.copy_shader.shader, this.fsQuad),
                          b.disable(b.BLEND));
                    this.end();
                    c++;
                }
            }
            c === 0 ? this.captureBuffer.texture.use(b.TEXTURE0) : this.outputBuffer.texture.use(b.TEXTURE0);
            this.accum && this.accumOpacity !== 1
                ? (this.blur_shader.shader.use(),
                  this.blur_shader.shader.setFloat("opacity", this.accumOpacity),
                  this.accumBuffer.use(),
                  b.enable(b.BLEND),
                  b.blendFunc(b.SRC_ALPHA, b.ONE_MINUS_SRC_ALPHA),
                  this.renderFSQuad(this.blur_shader.shader, this.fsQuad),
                  this.end(),
                  b.disable(b.BLEND),
                  this.renderFSQuad(this.copy_shader.shader, this.fsQuad),
                  b.enable(b.BLEND),
                  b.blendFunc(b.SRC_ALPHA, b.ONE_MINUS_SRC_ALPHA),
                  this.blur_shader.shader.use(),
                  this.blur_shader.shader.setFloat("opacity", this.accumIntensity),
                  this.accumBuffer.texture.use(b.TEXTURE0),
                  this.renderFSQuad(this.blur_shader.shader, this.fsQuad),
                  b.disable(b.BLEND))
                : this.renderFSQuad(this.copy_shader.shader, this.fsQuad);
        },
    };
    o.prototype = {
        createBuffer: function (a, c, e) {
            this.texture = this.depth = this.fbo = null;
            this.width = parseInt(a, 10);
            this.height = parseInt(c, 10);
            var a = this.sizeParam(a),
                c = this.sizeParam(c),
                d = m.gl;
            this.fbo = d.createFramebuffer();
            if (e) this.depth = d.createRenderbuffer();
            d.bindFramebuffer(d.FRAMEBUFFER, this.fbo);
            e &&
                (d.bindRenderbuffer(d.RENDERBUFFER, this.depth),
                navigator.appVersion.indexOf("Windows") !== -1
                    ? (d.renderbufferStorage(d.RENDERBUFFER, d.DEPTH_COMPONENT16, a, c), d.framebufferRenderbuffer(d.FRAMEBUFFER, d.DEPTH_ATTACHMENT, d.RENDERBUFFER, this.depth))
                    : (d.renderbufferStorage(d.RENDERBUFFER, d.DEPTH_STENCIL, a, c), d.framebufferRenderbuffer(d.FRAMEBUFFER, d.DEPTH_STENCIL_ATTACHMENT, d.RENDERBUFFER, this.depth)));
            this.texture = new CubicVR.Texture();
            d.bindTexture(d.TEXTURE_2D, u.Textures[this.texture.tex_id]);
            d.texParameteri(d.TEXTURE_2D, d.TEXTURE_MAG_FILTER, d.LINEAR);
            d.texParameteri(d.TEXTURE_2D, d.TEXTURE_MIN_FILTER, d.NEAREST);
            d.texParameteri(d.TEXTURE_2D, d.TEXTURE_WRAP_S, d.CLAMP_TO_EDGE);
            d.texParameteri(d.TEXTURE_2D, d.TEXTURE_WRAP_T, d.CLAMP_TO_EDGE);
            d.texImage2D(d.TEXTURE_2D, 0, d.RGBA, a, c, 0, d.RGBA, d.UNSIGNED_BYTE, null);
            d.framebufferTexture2D(d.FRAMEBUFFER, d.COLOR_ATTACHMENT0, d.TEXTURE_2D, u.Textures[this.texture.tex_id], 0);
            d.bindFramebuffer(d.FRAMEBUFFER, null);
        },
        destroyBuffer: function () {
            var a = m.gl;
            a.bindFramebuffer(a.FRAMEBUFFER, null);
            a.deleteRenderbuffer(this.depth);
            a.deleteFramebuffer(this.fbo);
            a.deleteTexture(u.Textures[this.texture.tex_id]);
            u.Textures[this.texture.tex_id] = null;
        },
        sizeParam: function (a) {
            return a;
        },
        use: function () {
            var a = m.gl;
            a.bindFramebuffer(a.FRAMEBUFFER, this.fbo);
        },
    };
    return { RenderBuffer: o, PostProcessShader: x, PostProcessChain: r, fsQuad: { make: r.prototype.makeFSQuad, destroy: r.prototype.destroyFSQuad, render: r.prototype.renderFSQuad } };
});
CubicVR.RegisterModule("Polygon", function (u) {
    function x(a) {
        var b = [],
            c = a.length;
        if (c < 3) return null;
        var e = [],
            g;
        g = a.length;
        for (var m = 0, o = g - 1, q = 0; q < g; o = q++) m += a[o][0] * a[q][1] - a[q][0] * a[o][1];
        if (0 < m * 0.5) for (g = 0; g < c; g++) e[g] = g;
        else for (g = 0; g < c; g++) e[g] = c - 1 - g;
        q = 2 * c;
        m = 0;
        for (g = c - 1; c > 2; ) {
            if (0 >= q--) return null;
            var r = g;
            c <= r && (r = 0);
            g = r + 1;
            c <= g && (g = 0);
            o = g + 1;
            c <= o && (o = 0);
            var z;
            a: {
                z = a;
                var A = r,
                    w = g,
                    y = o,
                    u = c,
                    x = e,
                    E = void 0,
                    P = void 0,
                    J = void 0,
                    I = void 0,
                    F = void 0,
                    G = void 0,
                    O = void 0,
                    K = void 0,
                    T = void 0,
                    P = z[x[A]][0],
                    J = z[x[A]][1],
                    I = z[x[w]][0],
                    F = z[x[w]][1],
                    G = z[x[y]][0],
                    O = z[x[y]][1];
                if (h > (I - P) * (O - J) - (F - J) * (G - P)) z = !1;
                else {
                    for (E = 0; E < u; E++)
                        if (!(E == A || E == w || E == y)) {
                            var K = z[x[E]][0],
                                T = z[x[E]][1],
                                X = void 0,
                                M = void 0,
                                Q = void 0,
                                N = void 0,
                                U = void 0,
                                Z = void 0,
                                $ = void 0,
                                S = void 0,
                                aa = void 0,
                                V = void 0,
                                W = void 0,
                                Y = void 0,
                                X = (Q = U = void 0),
                                X = G - I,
                                M = O - F,
                                Q = P - G,
                                N = J - O,
                                U = I - P,
                                Z = F - J,
                                $ = K - P,
                                S = T - J,
                                aa = K - I,
                                V = T - F,
                                W = K - G,
                                Y = T - O,
                                X = X * V - M * aa,
                                U = U * S - Z * $,
                                Q = Q * Y - N * W;
                            if (X >= 0 && Q >= 0 && U >= 0) {
                                z = !1;
                                break a;
                            }
                        }
                    z = !0;
                }
            }
            if (z) {
                q = e[r];
                r = e[g];
                o = e[o];
                b.push(q);
                b.push(r);
                b.push(o);
                m++;
                o = g;
                for (q = g + 1; q < c; o++, q++) e[o] = e[q];
                c--;
                q = 2 * c;
            }
        }
        return b;
    }
    function r(a, b, e) {
        e === c && (e = 0);
        var h;
        h = x(b);
        var g = CubicVR.util.repackArray(h, 3, h.length / 3),
            m = [],
            o = a.points.length;
        h = 0;
        for (iMax = b.length; h < iMax; h++) m.push([b[h][0], b[h][1], e]);
        a.addPoint(m);
        h = 0;
        for (iMax = g.length; h < iMax; h++) a.addFace([g[h][0] + o, g[h][1] + o, g[h][2] + o]);
    }
    function o(a, b) {
        var c = b[0] - a[0],
            e = b[1] - a[1];
        return Math.sqrt(c * c + e * e);
    }
    function q(a, b) {
        var c,
            e,
            h = [],
            g = a.length,
            m = b.length,
            q = [];
        for (c = 0; c < g; c++)
            for (e = 0; e < m; e++) {
                var r = o(a[c], b[e]);
                h.push([r, c, e]);
            }
        h.sort(function (a, d) {
            return a[0] > d[0];
        });
        for (c = 0; c < 5; c++)
            for (e = 0; e < h.length; e++) c != e && h[c][1] != h[e][1] && h[c][2] != h[e][2] && h[c][1] < h[e][1] && h[c][2] < h[e][2] && Math.abs(h[c][1] - h[e][1]) < 4 && Math.abs(h[c][2] - h[e][2]) < 4 && q.push([c, e]);
        q.sort(function (a, d) {
            return h[a[0]][0] + h[a[1]][0] > h[d[0]][0] + h[d[1]][0];
        });
        if (q.length > 10) q.length = 10;
        e = [];
        for (c = 0; c < q.length; c++) e.push([h[q[c][0]], h[q[c][1]]]);
        return e;
    }
    function m(a, b) {
        var c = q(a, b),
            e;
        if (!c.length) return null;
        e = c[0][0];
        var h = c[0][1],
            c = h[1] - e[1],
            h = h[2] - e[2],
            g = a.slice(e[1]),
            g = g.concat(a.slice(0, e[1])),
            m = b.slice(e[2]),
            m = m.concat(b.slice(0, e[2])),
            o = [];
        for (e = c; e < g.length; e++) o.push(g[e]);
        o.push(g[0]);
        for (e = h; e < m.length; e++) o.push(m[e]);
        o.push(m[0]);
        var r = [];
        for (e = 0; e <= c; e++) r.push(g[e]);
        for (e = 0; e <= h; e++) r.push(m[e]);
        return [o, r];
    }
    function e(a) {
        for (var b = [0, 0], c = 0; c < a.length; c++) (b[0] += a[c][0]), (b[1] += a[c][1]);
        b[0] /= a.length;
        b[1] /= a.length;
        return b;
    }
    function g(a, b, c) {
        for (var e = [], h = 0; h < a.length; h++) {
            var g = [a[h][0] - b[0], a[h][1] - b[1]],
                m = Math.sqrt(g[0] * g[0] + g[1] * g[1]) + c,
                g = Math.atan2(g[1], g[0]);
            e[h] = [b[0] + Math.cos(g) * m, b[1] + Math.sin(g) * m];
        }
        return e;
    }
    function a(a, b, c, e, h) {
        var g,
            m = a.points.length;
        if (b.length != c.length) return null;
        var o = b.length;
        for (g = 0; g < o; g++) a.addPoint([b[g][0], b[g][1], e]);
        for (g = 0; g < o; g++) a.addPoint([c[g][0], c[g][1], h]);
        for (g = 0; g < o - 1; g++) a.addFace([m + g, m + g + 1, m + (g + o + 1), m + (g + o)]);
        g = o - 1;
        a.addFace([m + g, m, m + o, m + (g + o)]);
    }
    function b(a) {
        this.points = a;
        this.cuts = [];
        this.result = [];
    }
    var c = u.undef,
        h = 1.0e-10;
    b.prototype = {
        cut: function (a) {
            this.cuts.push(a);
        },
        toMesh: function (a) {
            if (this.points.length !== 0) {
                var b;
                a || (a = new CubicVR.Mesh());
                this.result = [this.points];
                for (b = 0; b < this.cuts.length; b++) {
                    var c = this.cuts[b].points.slice(0),
                        c = c.reverse(),
                        c = m(this.result[0], c);
                    this.result[0] = c[0];
                    this.result.push(c[1]);
                }
                for (b = 0; b < this.result.length; b++) r(a, this.result[b]);
                a.removeDoubles();
                return a;
            }
        },
        toExtrudedMesh: function (d, b, e) {
            if (this.points.length !== 0) {
                var h, g;
                b === c && (b = 0);
                e === c && (e = 0);
                var o = b != e;
                d || (d = new CubicVR.Mesh());
                this.result = [this.points];
                for (g = 0; g < this.cuts.length; g++) (h = this.cuts[g].points.slice(0)), (h = h.reverse()), (h = m(this.result[0], h)), (this.result[0] = h[0]), this.result.push(h[1]);
                h = new CubicVR.Mesh();
                for (g = 0; g < this.result.length; g++) r(h, this.result[g], e);
                d.booleanAdd(h);
                h.flipFaces();
                if (o) for (g = 0; g < h.points.length; g++) h.points[g][2] = b;
                d.booleanAdd(h);
                if (o) {
                    a(d, this.points, this.points, b, e);
                    for (g = 0; g < this.cuts.length; g++) (h = this.cuts[g].points.slice(0)), (h = h.reverse()), a(d, h, h, b, e);
                }
                d.removeDoubles();
                return d;
            }
        },
        toExtrudedBeveledMesh: function (d, b, c, h, o, q, u) {
            var v = [],
                D = [],
                z,
                A,
                w,
                y;
            if (this.points.length !== 0) {
                typeof b === "object" && ((u = b), (b = u.front || 0), (c = u.back || 0), (h = u.frontDepth || 0), (o = u.frontShift || 0), (q = u.backDepth || 0), (u = u.backShift || 0));
                var x = b !== c,
                    B = q !== 0,
                    E = h !== 0;
                d || (d = new CubicVR.Mesh());
                E ? ((A = e(this.points)), (A = g(this.points, A, -o)), (this.result = [A.slice(0)])) : (this.result = [this.points.slice(0)]);
                for (y = 0; y < this.cuts.length; y++) (w = e(this.cuts[y].points)), (w = g(this.cuts[y].points, w, o)), (w = w.reverse()), v.push(w), (w = m(this.result[0], w)), (this.result[0] = w[0]), this.result.push(w[1]);
                o = new CubicVR.Mesh();
                for (y = 0; y < this.result.length; y++) r(o, this.result[y], b - h);
                o.flipFaces();
                d.booleanAdd(o);
                if (B || E) {
                    z = e(this.points);
                    z = g(this.points, z, -u);
                    this.result = [z.slice(0)];
                    for (y = 0; y < this.cuts.length; y++) (w = e(this.cuts[y].points)), (w = g(this.cuts[y].points, w, u)), (w = w.reverse()), D.push(w), (w = m(this.result[0], w)), (this.result[0] = w[0]), this.result.push(w[1]);
                    o = new CubicVR.Mesh();
                    for (y = 0; y < this.result.length; y++) r(o, this.result[y], c + q);
                } else {
                    for (y = 0; y < o.points.length; y++) o.points[y][2] = c;
                    o.flipFaces();
                }
                d.booleanAdd(o);
                E && a(d, A, this.points, b - h, b);
                x && a(d, this.points, this.points, b, c);
                B && a(d, this.points, z, c, c + q);
                for (y = 0; y < v.length; y++) (w = this.cuts[y].points.slice(0).reverse()), E && a(d, v[y], w, b - h, b), x && a(d, w, w, b, c), B && a(d, w, D[y], c, c + q);
                d.removeDoubles();
                return d;
            }
        },
    };
    return {
        polygon: {
            triangulate2D: x,
            toMesh: r,
            findNearPair: function (a, b) {
                for (var c = [0, 0], e = o(a[0], b[0]), h = a.length, g = b.length, m = 0; m < h; m++)
                    for (var q = 0; q < g; q++) {
                        var r = o(a[m], b[q]);
                        r < e && ((c[0] = m), (c[1] = q), (e = r));
                    }
                return c;
            },
            subtract: m,
            addOffset: function (a, b) {
                for (var c = [], e = 0, h = a.length; e < h; e++) {
                    var g = a[e];
                    c.push([g[0] + b[0], g[1] + b[1]]);
                }
                return c;
            },
        },
        Polygon: b,
    };
});
CubicVR.RegisterModule("Primitives", function (u) {
    function x(c, d, e, g, m, o) {
        var q = CubicVR.mat4,
            r = CubicVR.vec3,
            v = [],
            u,
            z = [0, 1, 0],
            A = [1, 0, 0],
            w = [0, 0, 0],
            y = c.points.length,
            x,
            B,
            E;
        for (x = u = 0; x < b; x += b / e) {
            if (u === e) break;
            A = [Math.cos(x), 0, Math.sin(x)];
            B = 0;
            for (E = d.length; B < E; B++) (w = r.add(r.multiply(A, d[B][0]), r.multiply(z, d[B][1]))), v[u] === a && (v[u] = []), v[u].push(w);
            u++;
        }
        E = null;
        m !== a && (E = m.getResult !== a ? m.getResult() : m);
        for (B = 0; B < e; B++) {
            m = 0;
            for (u = d.length; m < u; m++) E ? c.addPoint(q.vec3_multiply(v[B][m], E)) : c.addPoint(v[B][m]);
        }
        c.setFaceMaterial(g);
        for (m = 0; m < e; m++) {
            B = 0;
            for (E = d.length - 1; B < E; B++)
                (q = B + d.length * m),
                    (v = B + d.length * ((m + 1) % e)),
                    r.equal(c.points[y + q], c.points[y + v])
                        ? c.addFace([y + q + 1, y + v + 1, y + v])
                        : r.equal(c.points[y + q + 1], c.points[y + v + 1])
                        ? c.addFace([y + q, y + q + 1, y + v])
                        : c.addFace([y + q, y + q + 1, y + v + 1, y + v]);
        }
        o !== a && ((d = null), o.apply !== a ? (d = o) : o && (d = new CubicVR.UVMapper(o)), d !== null && (c.calcFaceNormals(), d.apply(c, g)));
    }
    function r(b, d, c, e, g) {
        var m = CubicVR.mat4;
        d *= 0.5;
        var o = b.points.length;
        b.setFaceMaterial(c);
        e !== a
            ? ((e = e.getResult !== a ? e.getResult() : e), b.addPoint([m.vec3_multiply([d, -d, 0], e), m.vec3_multiply([d, d, 0], e), m.vec3_multiply([-d, d, 0], e), m.vec3_multiply([-d, -d, 0], e)]))
            : b.addPoint([
                  [d, -d, 0],
                  [d, d, 0],
                  [-d, d, 0],
                  [-d, -d, 0],
              ]);
        b.addFace([
            [o + 0, o + 1, o + 2, o + 3],
            [o + 3, o + 2, o + 1, o + 0],
        ]);
        g !== a && ((m = null), g.apply !== a ? (m = g) : g && (m = new CubicVR.UVMapper(g)), m !== null && (b.calcFaceNormals(), m.apply(b, c)));
    }
    function o(b, d, c, e, g) {
        var m = CubicVR.mat4,
            o,
            q;
        typeof d === "object" ? ((o = d[0] / 2), (q = d[1] / 2), (d = d[2] / 2)) : (o = q = d /= 2);
        var r = b.points.length;
        b.setFaceMaterial(c);
        e !== a
            ? ((e = e.getResult !== a ? e.getResult() : e),
              b.addPoint([
                  m.vec3_multiply([o, -q, d], e),
                  m.vec3_multiply([o, q, d], e),
                  m.vec3_multiply([-o, q, d], e),
                  m.vec3_multiply([-o, -q, d], e),
                  m.vec3_multiply([o, -q, -d], e),
                  m.vec3_multiply([o, q, -d], e),
                  m.vec3_multiply([-o, q, -d], e),
                  m.vec3_multiply([-o, -q, -d], e),
              ]))
            : b.addPoint([
                  [o, -q, d],
                  [o, q, d],
                  [-o, q, d],
                  [-o, -q, d],
                  [o, -q, -d],
                  [o, q, -d],
                  [-o, q, -d],
                  [-o, -q, -d],
              ]);
        b.addFace([
            [r + 0, r + 1, r + 2, r + 3],
            [r + 7, r + 6, r + 5, r + 4],
            [r + 4, r + 5, r + 1, r + 0],
            [r + 5, r + 6, r + 2, r + 1],
            [r + 6, r + 7, r + 3, r + 2],
            [r + 7, r + 4, r + 0, r + 3],
        ]);
        g !== a && ((m = null), g.apply !== a ? (m = g) : g && (m = new CubicVR.UVMapper(g)), m !== null && (b.calcFaceNormals(), m.apply(b, c)));
    }
    function q(a, d, c, e, g, m, o, q) {
        var r = [];
        c -= d;
        d += c / 2;
        for (var u = b / g, z = 0, A = 0; A <= g; A++) r.push([d + Math.cos(z) * c, Math.sin(z) * c, 0]), (z += u);
        CubicVR.genLatheObject(a, r, e, m, o, q);
    }
    function m(a, d, b, c, e, g, m) {
        CubicVR.genLatheObject(
            a,
            [
                [0, -b / 2, 0],
                [d / 2, -b / 2, 0],
                [0, b / 2, 0],
            ],
            c,
            e,
            g,
            m
        );
    }
    function e(a, d, b, c, e, g, m) {
        CubicVR.genLatheObject(
            a,
            [
                [0, -b / 2, 0],
                [d, -b / 2, 0],
                [d, b / 2, 0],
                [0, b / 2, 0],
            ],
            c,
            e,
            g,
            m
        );
    }
    function g(a, d, b, e, g, m, o) {
        var q = [],
            e = (e /= 2) | 0;
        b |= 0;
        for (var r = Math.PI / e, u = -c, z = 0; z <= e; z++) q.push([Math.cos(u) * d, Math.sin(u) * d, 0]), (u += r);
        CubicVR.genLatheObject(a, q, b, g, m, o);
    }
    var a = u.undef,
        b = 2 * Math.PI,
        c = Math.PI / 2;
    return {
        genPlaneObject: r,
        genBoxObject: o,
        genLatheObject: x,
        genTorusObject: q,
        genConeObject: m,
        genCylinderObject: e,
        genSphereObject: g,
        primitives: {
            lathe: function (b) {
                var d, c;
                if (b.points == a) return null;
                d = b.mesh !== a ? b.mesh : new CubicVR.Mesh(b.name !== a ? b.name : a);
                c = b.material !== a ? b.material : new CubicVR.Material();
                x(d, b.points, b.divisions !== a ? b.divisions : 24, c, b.transform !== a ? b.transform : a, b.uvmapper !== a ? b.uvmapper : a);
                return d;
            },
            box: function (b) {
                var d, c;
                d = b.mesh !== a ? b.mesh : new CubicVR.Mesh(b.name !== a ? b.name : a);
                c = b.material !== a ? b.material : new CubicVR.Material();
                o(d, b.size !== a ? b.size : 1, c, b.transform !== a ? b.transform : a, b.uvmapper !== a ? b.uvmapper : a);
                return d;
            },
            plane: function (b) {
                var d, c;
                d = b.mesh !== a ? b.mesh : new CubicVR.Mesh(b.name !== a ? b.name : a);
                c = b.material !== a ? b.material : new CubicVR.Material();
                r(d, b.size !== a ? b.size : 1, c, b.transform !== a ? b.transform : a, b.uvmapper !== a ? b.uvmapper : a);
                return d;
            },
            sphere: function (b) {
                var d, c;
                d = b.mesh !== a ? b.mesh : new CubicVR.Mesh(b.name !== a ? b.name : a);
                c = b.material !== a ? b.material : new CubicVR.Material();
                g(d, b.radius !== a ? b.radius : 1, b.lon !== a ? b.lon : 24, b.lat !== a ? b.lat : 24, c, b.transform !== a ? b.transform : a, b.uvmapper !== a ? b.uvmapper : a);
                return d;
            },
            torus: function (b) {
                var d, c;
                d = b.mesh !== a ? b.mesh : new CubicVR.Mesh(b.name !== a ? b.name : a);
                c = b.material !== a ? b.material : new CubicVR.Material();
                q(d, b.innerRadius !== a ? b.innerRadius : 0.75, b.outerRadius !== a ? b.outerRadius : 1, b.lon !== a ? b.lon : 24, b.lat !== a ? b.lat : 24, c, b.transform !== a ? b.transform : a, b.uvmapper !== a ? b.uvmapper : a);
                return d;
            },
            cone: function (b) {
                var d, c;
                d = b.mesh !== a ? b.mesh : new CubicVR.Mesh(b.name !== a ? b.name : a);
                c = b.material !== a ? b.material : new CubicVR.Material();
                m(d, b.base !== a ? b.base : 1, b.height !== a ? b.height : 1, b.lon !== a ? b.lon : 24, c, b.transform !== a ? b.transform : a, b.uvmapper !== a ? b.uvmapper : a);
                return d;
            },
            cylinder: function (b) {
                var d, c, g, m, o, q;
                d = b.mesh !== a ? b.mesh : new CubicVR.Mesh(b.name !== a ? b.name : a);
                c = b.material !== a ? b.material : new CubicVR.Material();
                g = b.transform !== a ? b.transform : a;
                m = b.uvmapper !== a ? b.uvmapper : a;
                o = b.radius !== a ? b.radius : 1;
                q = b.height !== a ? b.height : 1;
                lon = b.lon !== a ? b.lon : 24;
                e(d, o, q, lon, c, g, m);
                return d;
            },
        },
    };
});
CubicVR.RegisterModule("Renderer", function (u) {
    var x = u.undef;
    return {
        renderObject: function (r, o, q, m) {
            if (r.compiled !== null) {
                var e = 0,
                    g = CubicVR.GLCore.gl,
                    a = m === x ? 0 : m.length,
                    b,
                    c = 0,
                    h,
                    d = null,
                    n = r.instanceMaterials || r.materials,
                    t = !1,
                    s,
                    H,
                    C;
                g.depthFunc(g.LEQUAL);
                q === x && (q = cubicvr_identity);
                for (var L = 0, v = r.compiled.elements_ref.length; L < v; L++) {
                    var d = n[L],
                        D = 0,
                        c = !1;
                    d.opacity !== 1 ? (g.enable(g.BLEND), g.depthMask(0), g.blendFunc(g.SRC_ALPHA, g.ONE_MINUS_SRC_ALPHA)) : (g.depthMask(1), g.disable(g.BLEND), g.blendFunc(g.ONE, g.ONE));
                    for (var z = 0, A = r.compiled.elements_ref[L].length; z < A; z++)
                        if (((h = r.compiled.elements_ref[L][z][0]), (c = !1), (s = r.compiled.elements_ref[L][z][1]), (D += s), !r.segment_state[h]))
                            if (D > s) {
                                e += s * 2;
                                D -= s;
                                if (a) {
                                    H = !1;
                                    for (s = 0; s < a; ) {
                                        var w = a - s;
                                        if (w > u.MAX_LIGHTS) w = u.MAX_LIGHTS;
                                        s > 0 && !H && (g.enable(g.BLEND), g.blendFunc(g.ONE, g.ONE), g.depthFunc(g.EQUAL), (H = !0));
                                        b = m[s];
                                        C = b.light_type;
                                        for (c = 0; c < w; c++)
                                            if (m[c + s].light_type != C) {
                                                w = c;
                                                break;
                                            }
                                        d.use(b.light_type, w);
                                        b = d.shader[b.light_type][w];
                                        g.uniformMatrix4fv(b.uMVMatrix, !1, o.mvMatrix);
                                        g.uniformMatrix4fv(b.uPMatrix, !1, o.pMatrix);
                                        g.uniformMatrix4fv(b.uOMatrix, !1, q);
                                        g.uniformMatrix3fv(b.uNMatrix, !1, o.nMatrix);
                                        t || (d.bindObject(r, b), (t = b.aTextureCoord != -1));
                                        for (c = 0; c < w; c++) m[c + s].setupShader(b, c);
                                        g.drawElements(g.TRIANGLES, D, g.UNSIGNED_SHORT, e);
                                        s += w;
                                    }
                                    H && (g.disable(g.BLEND), g.depthFunc(g.LEQUAL));
                                } else
                                    d.use(0, 0),
                                        g.uniformMatrix4fv(d.shader[0][0].uMVMatrix, !1, o.mvMatrix),
                                        g.uniformMatrix4fv(d.shader[0][0].uPMatrix, !1, o.pMatrix),
                                        g.uniformMatrix4fv(d.shader[0][0].uOMatrix, !1, q),
                                        g.uniformMatrix3fv(d.shader[0][0].uNMatrix, !1, o.nMatrix),
                                        t || (d.bindObject(r, d.shader[0][0]), (t = d.shader[0][0].aTextureCoord != -1)),
                                        g.drawElements(g.TRIANGLES, D, g.UNSIGNED_SHORT, e);
                                e += D * 2;
                                D = 0;
                                c = !0;
                            } else (e += D * 2), (D = 0);
                    if (!c && r.segment_state[h]) {
                        if (a) {
                            H = !1;
                            for (s = 0; s < a; ) {
                                w = a - s;
                                if (w > u.MAX_LIGHTS) w = u.MAX_LIGHTS;
                                s > 0 && !H && (g.enable(g.BLEND), g.blendFunc(g.ONE, g.ONE), g.depthFunc(g.EQUAL), (H = !0));
                                b = m[s];
                                C = b.light_type;
                                for (c = 0; c < w; c++)
                                    if (m[c + s].light_type != C) {
                                        w = c;
                                        break;
                                    }
                                d.use(b.light_type, w);
                                b = d.shader[b.light_type][w];
                                g.uniformMatrix4fv(b.uMVMatrix, !1, o.mvMatrix);
                                g.uniformMatrix4fv(b.uPMatrix, !1, o.pMatrix);
                                g.uniformMatrix4fv(b.uOMatrix, !1, q);
                                g.uniformMatrix3fv(b.uNMatrix, !1, o.nMatrix);
                                t || (d.bindObject(r, b), (t = b.aTextureCoord != -1));
                                for (c = 0; c < w; c++) m[c + s].setupShader(b, c);
                                g.drawElements(g.TRIANGLES, D, g.UNSIGNED_SHORT, e);
                                s += w;
                            }
                            H && (g.disable(g.BLEND), g.depthFunc(g.LEQUAL));
                        } else
                            d.use(0, 0),
                                g.uniformMatrix4fv(d.shader[0][0].uMVMatrix, !1, o.mvMatrix),
                                g.uniformMatrix4fv(d.shader[0][0].uPMatrix, !1, o.pMatrix),
                                g.uniformMatrix4fv(d.shader[0][0].uOMatrix, !1, q),
                                g.uniformMatrix3fv(d.shader[0][0].uNMatrix, !1, o.nMatrix),
                                t || (d.bindObject(r, d.shader[0][0]), (t = d.shader[0][0].aTextureCoord != -1)),
                                g.drawElements(g.TRIANGLES, D, g.UNSIGNED_SHORT, e);
                        e += D * 2;
                    }
                }
                d && b && d.clearObject(r, b);
                g.depthMask(1);
                g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, null);
            }
        },
    };
});
CubicVR.RegisterModule("Scene", function (u) {
    function x(a, b) {
        return a.light_type - b.light_type;
    }
    function r(d, c) {
        var e = null;
        d !== m && d !== null && (e = d.compile ? null : d);
        e
            ? ((this.morphWeight = e.morphWeight || 0),
              (this.morphSource = e.morphSource || -1),
              (this.morphTarget = e.morphTarget || -1),
              (this.position = e.position === m ? [0, 0, 0] : e.position),
              (this.rotation = e.rotation === m ? [0, 0, 0] : e.rotation),
              (this.scale = e.scale === m ? [1, 1, 1] : e.scale),
              (this.shadowCast = e.shadowCast === m ? !0 : e.shadowCast),
              (this.motion = e.motion === m ? null : e.motion),
              (this.obj = e.mesh === m ? (d !== m && e.faces !== m ? d : null) : e.mesh),
              (this.name = e.name === m ? (c !== m ? c : null) : e.name))
            : ((this.position = [0, 0, 0]), (this.rotation = [0, 0, 0]), (this.scale = [1, 1, 1]), (this.motion = null), (this.obj = d), (this.name = c), (this.shadowCast = !0));
        this.parent = this.children = null;
        this.drawn_this_frame = !1;
        this.lposition = [0, 0, 0];
        this.lrotation = [0, 0, 0];
        this.lscale = [0, 0, 0];
        this.lMatrix = b.identity();
        this.tMatrix = b.identity();
        this.dirty = !0;
        this.aabb = [];
        this.id = -1;
        this.octree_leaves = [];
        this.octree_common_root = null;
        this.octree_aabb = [
            [0, 0, 0],
            [0, 0, 0],
        ];
        a.reset(this.octree_aabb, [0, 0, 0]);
        this.ignore_octree = !1;
        this.was_culled = this.culled = this.visible = !0;
        this.dynamic_lights = [];
        this.static_lights = [];
        this.matrixLock = !1;
        this.instanceMaterials = null;
    }
    function o(a, b, c, e, g, m) {
        this.frames = 0;
        this.sceneObjects = [];
        this.sceneObjectsByName = [];
        this.sceneObjectsById = [];
        this.lights = [];
        this.global_lights = [];
        this.dynamic_lights = [];
        this.pickables = [];
        this.stats = [];
        this.cameras = [];
        this.camerasByName = [];
        this.collect_stats = !1;
        typeof a === "object"
            ? ((this.octree = a.octree),
              (this.skybox = a.skybox || null),
              (this.camera = new CubicVR.Camera(a.width, a.height, a.fov, a.nearclip, a.farclip)),
              (this.name = a.name || "scene" + h),
              (this.destroy = a.destroy || function () {}),
              (this.update = a.update || function () {}),
              (this.enable = a.enable || function () {}),
              (this.disable = a.disable || function () {}),
              (a = a.setup && a.setup(this)),
              (this.update = a.update || this.update),
              (this.enable = a.enable || this.enable),
              (this.disable = a.disable || this.disable),
              (this.destroy = a.destroy || this.destroy))
            : ((this.skybox = null), (this.octree = m), (this.camera = new CubicVR.Camera(a, b, c, e, g)), (this.name = "scene" + h));
        this.paused = !1;
        ++h;
    }
    function q() {
        this.meshBin = {};
        this.imageBin = {};
        this.meshMap = {};
        this.imageMap = {};
        this.imageBinPtr = {};
        this.meshBinPtr = {};
    }
    var m = u.undef,
        e = CubicVR.enums,
        g = u.GLCore,
        a = CubicVR.aabb,
        b = CubicVR.mat4,
        c = 0;
    r.prototype = {
        getInstanceMaterials: function () {
            if (!this.obj) return null;
            if (this.instanceMaterials) return this.instanceMaterials;
            this.instanceMaterials = [];
            for (var a = 0, b = this.obj.materials.length; a < b; a++) this.instanceMaterials[a] = this.obj.materials[a].clone();
            return this.instanceMaterials;
        },
        getInstanceMaterial: function (a) {
            for (var b = this.getInstanceMaterials(), c = 0, e = b.length; c < e; c++) if (b[c].name == a) return b[c];
            return null;
        },
        setMorphSource: function (a) {
            this.morphSource = a;
        },
        setMorphTarget: function (a) {
            this.morphTarget = a;
        },
        getMorphSource: function () {
            return this.morphSource;
        },
        getMorphTarget: function () {
            return this.morphTarget;
        },
        setMorphWeight: function (a) {
            this.morphWeight = a;
        },
        morphTargetCount: function () {
            return this.obj.morphTargets !== null ? this.obj.morphTargets.length : 0;
        },
        setMatrix: function (a) {
            a ? ((this.tMatrix = a.slice(0)), (this.matrixLock = !0)) : (this.matrixLock = !1);
        },
        doTransform: function (a) {
            var c = CubicVR.vec3;
            if (!this.matrixLock && (!c.equal(this.lposition, this.position) || !c.equal(this.lrotation, this.rotation) || !c.equal(this.lscale, this.scale) || a !== m))
                a !== m ? (this.tMatrix = a.slice(0)) : b.identity(this.tMatrix),
                    b.identity(this.lMatrix),
                    b.translate(this.position[0], this.position[1], this.position[2], this.lMatrix),
                    b.rotate(this.rotation[0], this.rotation[1], this.rotation[2], this.lMatrix),
                    (this.scale[0] === 1 && this.scale[1] === 1 && this.scale[2] === 1) || b.scale(this.scale[0], this.scale[1], this.scale[2], this.lMatrix),
                    b.multiply(this.tMatrix.slice(0), this.lMatrix, this.tMatrix),
                    (this.lposition[0] = this.position[0]),
                    (this.lposition[1] = this.position[1]),
                    (this.lposition[2] = this.position[2]),
                    (this.lrotation[0] = this.rotation[0]),
                    (this.lrotation[1] = this.rotation[1]),
                    (this.lrotation[2] = this.rotation[2]),
                    (this.lscale[0] = this.scale[0]),
                    (this.lscale[1] = this.scale[1]),
                    (this.lscale[2] = this.scale[2]),
                    (this.dirty = !0);
        },
        adjust_octree: function () {
            var b = this.getAABB(),
                c = this.octree_aabb,
                e = b[0][0],
                g = b[0][1],
                h = b[0][2],
                o = b[1][0],
                q = b[1][1],
                r = b[1][2],
                u = c[0][0],
                z = c[0][1],
                A = c[0][2],
                w = c[1][0],
                y = c[1][1],
                c = c[1][2];
            if (this.octree_leaves.length > 0 && (e < u || g < z || h < A || o > w || q > y || r > c)) {
                for (e = 0; e < this.octree_leaves.length; ++e) this.octree_leaves[e].remove(this);
                this.octree_leaves = [];
                this.static_lights = [];
                e = this.octree_common_root;
                this.octree_common_root = null;
                if (e !== null) {
                    for (;;)
                        if (!e.contains_point(b[0]) || !e.contains_point(b[1]))
                            if (e._root !== m && e._root !== null) e = e._root;
                            else break;
                        else break;
                    a.reset(this.octree_aabb, this.position);
                    e.insert(this);
                }
            }
        },
        bindChild: function (a) {
            if (this.children === null) this.children = [];
            a.parent = this;
            this.children.push(a);
        },
        control: function (a, b, c) {
            a === e.motion.POS ? (this.position[b] = c) : a === e.motion.SCL ? (this.scale[b] = c) : a === e.motion.ROT && (this.rotation[b] = c);
        },
        getAABB: function () {
            var a = CubicVR.mat4,
                b = CubicVR.vec3;
            if (this.dirty) {
                var c = Array(8);
                this.doTransform();
                var e, g;
                if (this.obj) {
                    if (!this.obj.bb) return (this.aabb = [b.add([-1, -1, -1], this.position), b.add([1, 1, 1], this.position)]);
                    e = this.obj.bb[0];
                    g = this.obj.bb[1];
                }
                if (!this.obj || e === m || g === m) return (this.aabb = [b.add([-1, -1, -1], this.position), b.add([1, 1, 1], this.position)]);
                var h = e;
                e = b.subtract(g, e);
                c[0] = [h[0], h[1], h[2]];
                c[1] = [h[0], h[1], h[2] + e[2]];
                c[2] = [h[0] + e[0], h[1], h[2]];
                c[3] = [h[0] + e[0], h[1], h[2] + e[2]];
                c[4] = [h[0], h[1] + e[1], h[2]];
                c[5] = [h[0], h[1] + e[1], h[2] + e[2]];
                c[6] = [h[0] + e[0], h[1] + e[1], h[2]];
                c[7] = [h[0] + e[0], h[1] + e[1], h[2] + e[2]];
                h = a.vec3_multiply(c[0], this.tMatrix);
                e = [h[0], h[1], h[2]];
                g = [h[0], h[1], h[2]];
                for (b = 1; b < 8; ++b)
                    (h = a.vec3_multiply(c[b], this.tMatrix)),
                        e[0] > h[0] && (e[0] = h[0]),
                        e[1] > h[1] && (e[1] = h[1]),
                        e[2] > h[2] && (e[2] = h[2]),
                        g[0] < h[0] && (g[0] = h[0]),
                        g[1] < h[1] && (g[1] = h[1]),
                        g[2] < h[2] && (g[2] = h[2]);
                this.aabb[0] = e;
                this.aabb[1] = g;
                this.dirty = !1;
            }
            return this.aabb;
        },
    };
    var h = 0;
    o.prototype = {
        attachOctree: function (b) {
            this.octree = b;
            b.init && b.init(this);
            b = this.lights;
            this.lights = [];
            for (var e = 0, g = b.length; e < g; e++) this.bindLight(b[e]);
            b = this.sceneObjects;
            if (this.octree !== m) {
                e = 0;
                for (g = b.length; e < g; ++e) {
                    var h = b[e];
                    if (h.obj !== null) {
                        if (h.id < 0) (h.id = c), ++c;
                        this.sceneObjectsById[h.id] = h;
                        a.reset(h.octree_aabb, h.position);
                        this.octree.insert(h);
                        (h.octree_common_root === void 0 || h.octree_common_root === null) && log("!!", h.name, "octree_common_root is null");
                    }
                }
            }
        },
        setSkyBox: function (a) {
            this.skybox = a;
        },
        getSceneObject: function (a) {
            return this.sceneObjectsByName[a];
        },
        bindSceneObject: function (b, e, g) {
            if (this.sceneObjects.indexOf(b) == -1) {
                this.sceneObjects.push(b);
                e !== m && e && this.pickables.push(b);
                b.name !== null && (this.sceneObjectsByName[b.name] = b);
                if (this.octree !== m && (g === m || g === "true")) {
                    if (b.id < 0) (b.id = c), ++c;
                    this.sceneObjectsById[b.id] = b;
                    a.reset(b.octree_aabb, b.position);
                    this.octree.insert(b);
                }
                if (b.children) for (var h = 0, o = b.children.length; h < o; h++) this.bindSceneObject(b.children[h], e, g);
                return b;
            }
        },
        removeLight: function (a) {
            a = this.lights.indexOf(a);
            a >= 0 && this.lights.splice(a, 1);
        },
        removeSceneObject: function (a) {
            var b;
            b = this.sceneObjects.indexOf(a);
            b >= 0 && this.sceneObjects.splice(b, 1);
            b = this.pickables.indexOf(a);
            b >= 0 && this.pickables.splice(b, 1);
            a.name !== null && this.sceneObjectsByName[a.name] !== m && delete this.sceneObjectsByName[a.name];
            if (a.children) {
                b = 0;
                for (var c = a.children.length; b < c; b++) this.removeSceneObject(a.children[b]);
            }
        },
        bindLight: function (a, b) {
            this.lights.push(a);
            if (this.octree !== m && (b === m || b === "true")) a.method === e.light.method.GLOBAL ? this.global_lights.push(a) : (a.method === e.light.method.DYNAMIC && this.dynamic_lights.push(a), this.octree.insert_light(a));
            this.lights = this.lights.sort(x);
        },
        bindCamera: function (a) {
            this.cameras.indexOf(a) === -1 && (this.cameras.push(a), (this.camerasByName[a.name] = a));
            this.camera = a;
        },
        removeCamera: function (a) {
            typeof a !== "object" && (a = this.getCamera(camName));
            this.cameras.indexOf(a) === -1 && (this.cameras.push(a), (this.camerasByName[a.name] = a));
            return a;
        },
        setCamera: function (a) {
            if (a) typeof a !== "object" && (a = this.getCamera(a)), (this.camera = a);
        },
        getCamera: function (a) {
            if (a === m) return this.camera;
            return this.camerasByName[a];
        },
        evaluate: function (a) {
            var b, c;
            b = 0;
            for (c = this.sceneObjects.length; b < c; b++) this.sceneObjects[b].motion && this.sceneObjects[b].motion.apply(a, this.sceneObjects[b]);
            if (this.camera.motion !== null) {
                if (this.camera.targetSceneObject !== null) this.camera.target = this.camera.targetSceneObject.position;
                this.camera.motion.apply(a, this.camera);
            }
            b = 0;
            for (c = this.lights.length; b < c; b++) {
                var e = this.lights[b];
                e.motion !== null && e.motion.apply(a, e);
            }
        },
        prepareTransforms: function (a) {
            var b, c;
            if (a) {
                if (a.children) {
                    b = 0;
                    for (c = a.children.length; b < c; b++) a.children[b].doTransform(a.tMatrix), this.prepareTransforms(a.children[b]);
                }
            } else if (this.sceneObjects.length !== 0) {
                b = 0;
                for (c = this.sceneObjects.length; b < c; ++b) this.prepareTransforms(this.sceneObjects[b]);
            }
        },
        renderSceneObjectChildren: function (a, b, c) {
            for (var e = g.gl, h = !1, m = 0, o = a.children.length; m < o; m++) {
                var q = a.children[m];
                if (q.visible !== !1) {
                    try {
                        q.doTransform(a.tMatrix);
                    } catch (r) {
                        break;
                    }
                    var u = q.obj;
                    if (u) {
                        q.scale[0] < 0 && (h = !h);
                        q.scale[1] < 0 && (h = !h);
                        q.scale[2] < 0 && (h = !h);
                        h && e.cullFace(e.FRONT);
                        if (u.morphTargets && (q.morphSource !== -1 && u.setMorphSource(q.morphSource), q.morphTarget !== -1 && u.setMorphTarget(q.morphTarget), q.morphWeight !== null)) u.morphWeight = q.morphWeight;
                        q.instanceMaterials && u.bindInstanceMaterials(q.instanceMaterials);
                        CubicVR.renderObject(u, b, q.tMatrix, c);
                        q.instanceMaterials && u.bindInstanceMaterials(null);
                        h && e.cullFace(e.BACK);
                    }
                    q.children && this.renderSceneObjectChildren(q, b, c);
                }
            }
        },
        updateShadows: function () {
            var a = g.gl,
                b = !1;
            if (u.features.lightShadows) {
                this.updateCamera();
                for (var c = !1, h = a.getParameter(a.VIEWPORT), m = 0, o = this.lights.length; m < o; m++) {
                    var q = this.lights[m];
                    if (q.light_type == e.light.type.SPOT_SHADOW || q.light_type == e.light.type.SPOT_SHADOW_PROJECTOR || q.light_type == e.light.type.AREA) {
                        var c = !0,
                            r = new CubicVR.Light(e.light.type.DEPTH_PACK);
                        if (q.light_type === e.light.type.AREA) (q.areaCam = this.camera), q.updateAreaLight();
                        g.shadow_near = q.dummyCam.nearclip;
                        g.shadow_far = q.dummyCam.farclip;
                        q.shadowBegin();
                        for (var x = 0, z = this.sceneObjects.length; x < z; x++) {
                            var A = this.sceneObjects[x];
                            if (!A.parent && !(A.visible === !1 || A.shadowCast === !1)) {
                                A.doTransform();
                                if (A.obj) {
                                    A.scale[0] < 0 && (b = !b);
                                    A.scale[1] < 0 && (b = !b);
                                    A.scale[2] < 0 && (b = !b);
                                    b && a.cullFace(a.FRONT);
                                    var w = A.obj;
                                    if (w.morphTargets && (A.morphSource !== -1 && w.setMorphSource(A.morphSource), A.morphTarget !== -1 && w.setMorphTarget(A.morphTarget), A.morphWeight !== null)) w.morphWeight = A.morphWeight;
                                    A.instanceMaterials && w.bindInstanceMaterials(A.instanceMaterials);
                                    CubicVR.renderObject(w, q.dummyCam, A.tMatrix, [r]);
                                    A.instanceMaterials && w.bindInstanceMaterials(null);
                                    b && a.cullFace(a.BACK);
                                    b = !1;
                                }
                                A.children && this.renderSceneObjectChildren(A, q.dummyCam, [r]);
                            }
                        }
                        q.shadowEnd();
                    }
                }
                c && a.viewport(h[0], h[1], h[2], h[3]);
            }
        },
        updateCamera: function () {
            this.camera.manual === !1 &&
                (this.camera.targeted
                    ? this.camera.lookat(this.camera.position[0], this.camera.position[1], this.camera.position[2], this.camera.target[0], this.camera.target[1], this.camera.target[2], 0, 1, 0)
                    : this.camera.calcProjection());
            g.depth_alpha_near = this.camera.nearclip;
            g.depth_alpha_far = this.camera.farclip;
        },
        resize: function (a, b) {
            this.camera && this.camera.setDimensions(a, b);
        },
        doTransform: function () {
            for (var a = this.octree !== m, b = 0, c = this.sceneObjects.length; b < c; b++) {
                var e = this.sceneObjects[b];
                if (e.parent === null && (e.doTransform(), a && ((lights = []), e.dirty && e.obj !== null && e.adjust_octree(), !(e.visible === !1 || (a && (e.ignore_octree || e.drawn_this_frame === !0 || e.culled === !0))))))
                    (lights = e.dynamic_lights),
                        (lights = lights.concat(e.static_lights)),
                        (lights = lights.concat(this.global_lights)),
                        this.collect_stats && ((lights_rendered = Math.max(lights.length, lights_rendered)), lights_rendered === lights.length && (lights_list = lights), ++objects_rendered),
                        (lights = lights.length === 0 ? [g.emptyLight] : lights.sort(x)),
                        (e.drawn_this_frame = !0);
            }
        },
        render: function () {
            ++this.frames;
            var a = g.gl,
                c;
            c = 0;
            if (this.octree !== m) this.octree.reset_node_visibility(), this.octree.cleanup(), (c = this.octree.get_frustum_hits(this.camera)), (c = c.lights.length);
            this.doTransform();
            this.updateCamera();
            var e, h;
            e = 0;
            for (h = this.lights.length; e < h; e++) this.lights[e].prepare(this.camera);
            var o = !1,
                q = [];
            e = 0;
            for (h = this.sceneObjects.length; e < h; e++) {
                var r = this.lights,
                    v = this.sceneObjects[e];
                if (!(v.visible === !1 || v.parent !== null)) {
                    if (v.obj) {
                        v.scale[0] < 0 && (o = !o);
                        v.scale[1] < 0 && (o = !o);
                        v.scale[2] < 0 && (o = !o);
                        o && a.cullFace(a.FRONT);
                        var u = v.obj;
                        if (u.morphTargets !== null && (v.morphSource !== -1 && u.setMorphSource(v.morphSource), v.morphTarget !== -1 && u.setMorphTarget(v.morphTarget), v.morphWeight !== null)) u.morphWeight = v.morphWeight;
                        v.instanceMaterials && u.bindInstanceMaterials(v.instanceMaterials);
                        CubicVR.renderObject(u, this.camera, v.tMatrix, r);
                        v.instanceMaterials && u.bindInstanceMaterials(null);
                        o && a.cullFace(a.BACK);
                        o = !1;
                    }
                    v.children && this.renderSceneObjectChildren(v, this.camera, r);
                }
            }
            if (this.collect_stats)
                (this.stats["objects.num_rendered"] = 0),
                    (this.stats["lights.num_rendered"] = c),
                    (this.stats["lights.rendered"] = q),
                    (this.stats["lights.num_global"] = this.global_lights.length),
                    (this.stats["lights.num_dynamic"] = this.dynamic_lights.length);
            if (this.skybox !== null && this.skybox.ready === !0)
                a.cullFace(a.FRONT),
                    (c = (this.camera.farclip * 2) / Math.sqrt(3)),
                    (this.skybox.scene_object.position = this.camera.parent ? b.vec3_multiply(this.camera.position, this.camera.parent.tMatrix) : [this.camera.position[0], this.camera.position[1], this.camera.position[2]]),
                    (this.skybox.scene_object.scale = [c, c, c]),
                    this.skybox.scene_object.doTransform(),
                    CubicVR.renderObject(this.skybox.scene_object.obj, this.camera, this.skybox.scene_object.tMatrix, []),
                    a.cullFace(a.BACK);
        },
        bbRayTest: function (a, b, c) {
            var e = CubicVR.vec3,
                h = [],
                b = b.length === 2 ? this.camera.unProject(b[0], b[1]) : e.add(a, b),
                g;
            for (g in this.pickables)
                if (this.pickables.hasOwnProperty(g)) {
                    var m = this.pickables[g];
                    if (m.visible === !0) {
                        var o, q;
                        q = m.getAABB();
                        o = q[0];
                        q = q[1];
                        q[0] - o[0] < 0.2 && ((o[0] -= 0.1), (q[0] += 0.1));
                        q[1] - o[1] < 0.2 && ((o[1] -= 0.1), (q[1] += 0.1));
                        q[2] - o[2] < 0.2 && ((o[2] -= 0.1), (q[2] += 0.1));
                        var r = e.multiply(e.add(o, q), 0.5),
                            u = e.getClosestTo(a, b, r),
                            r = e.length(e.subtract(u, r));
                        (u[0] >= o[0] && u[0] <= q[0] ? 1 : 0) + (u[1] >= o[1] && u[1] <= q[1] ? 1 : 0) + (u[2] >= o[2] && u[2] <= q[2] ? 1 : 0) >= c && h.push({ dist: r, obj: m });
                    }
                }
            h.length &&
                h.sort(function (a, b) {
                    if (a.dist == b.dist) return 0;
                    return a.dist < b.dist ? -1 : 1;
                });
            return h;
        },
    };
    q.prototype = {
        addMesh: function (a, b, c) {
            this.meshBin[a] === m && ((this.meshBin[a] = []), this.meshBinPtr[a] === m && (this.meshBinPtr[a] = 0));
            this.meshMap[b] === m && ((this.meshMap[b] = c), this.meshBin[a].push(c));
        },
        addImage: function (a, b, c) {
            this.imageBin[a] === m && ((this.imageBin[a] = []), this.imageBinPtr[a] === m && (this.imageBinPtr[a] = 0));
            this.imageMap[b] === m && ((this.imageMap[b] = c), this.imageBin[a].push(c));
        },
        getMeshes: function (a) {
            return this.meshBin[a];
        },
        getImages: function (a) {
            return this.imageBin[a];
        },
        rewindMeshes: function (a) {
            this.meshBinPtr[a] = 0;
        },
        rewindImages: function (a) {
            this.imageBinPtr[a] = 0;
        },
        getNextMesh: function (a) {
            var b = this.meshBinPtr[a];
            if (b < this.meshBin[a].length) return this.meshBinPtr[a]++, this.meshBin[a][b];
            return null;
        },
        loadNextMesh: function (a) {
            a = this.getNextMesh(a);
            if (a !== null) return a.compiled === null && (a.triangulateQuads(), a.compile(), a.clean()), !0;
            return !1;
        },
        isMeshBinEmpty: function (a) {
            return this.meshBinPtr[a] === this.meshBin[a].length;
        },
        loadNextImage: function (a) {
            a = this.getNextImage(a);
            if (a !== null) a.src = a.deferredSrc;
        },
        getNextImage: function (a) {
            var b = this.imageBinPtr[a];
            if (b < this.imageBin[a].length) return this.imageBinPtr[a]++, this.imageBin[a][b];
            return null;
        },
        isImageBinEmpty: function (a) {
            return this.imageBinPtr[a] === this.imageBin[a].length;
        },
    };
    return {
        Scene: o,
        SceneObject: r,
        SkyBox: function (a) {
            var b = a.texture,
                a = a.mapping,
                c = this;
            this.mapping = null;
            this.ready = !1;
            this.texture = null;
            this.onready = function () {
                b.onready = null;
                var a = 1 / u.Images[c.texture.tex_id].width;
                if (c.mapping === null)
                    c.mapping = [
                        [1 / 3, 0.5, 2 / 3 - a, 1],
                        [0, 0.5, 1 / 3, 1],
                        [0, 0, 1 / 3 - a, 0.5],
                        [2 / 3, 0, 1, 0.5],
                        [2 / 3 + a, 0.5, 1, 1],
                        [1 / 3, 0, 2 / 3, 0.5],
                    ];
                var a = new CubicVR.Material({ name: "skybox", textures: { color: b } }),
                    d = new CubicVR.Mesh();
                d.sky_mapping = c.mapping;
                CubicVR.primitives.box({ mesh: d, size: 1, material: a, uvmapper: { projectionMode: CubicVR.enums.uv.projection.SKY, scale: [1, 1, 1] } });
                d.prepare();
                c.scene_object = new CubicVR.SceneObject(d);
                c.ready = !0;
            };
            if (b) {
                if (typeof b === "string") b = new CubicVR.Texture(b, null, null, null, this.onready);
                else if (!b.loaded) b.onready = this.onready;
                this.texture = b;
                if (a) (this.mapping = a), this.onready();
            }
        },
        DeferredBin: q,
    };
});
CubicVR.RegisterModule("ScenePhysics", function (u) {
    function x(a, b) {
        b.setX(a[0]);
        b.setY(a[1]);
        b.setZ(a[2]);
    }
    function r(a) {
        return new Ammo.btVector3(a[0], a[1], a[2]);
    }
    function o(a) {
        b.fromEuler(a[0], a[1], a[2]);
        return new Ammo.btQuaternion(b.x, b.y, b.z, b.w);
    }
    function q(a) {
        return [a.x(), a.y(), a.z()];
    }
    var m = u.undef,
        e = CubicVR.enums,
        g = u.nop;
    e.physics = { body: { STATIC: 0, DYNAMIC: 1, SOFT: 2 }, constraint: { P2P: 0 } };
    var a,
        b,
        c,
        u = function (a, b) {
            this.properties = new CubicVR.RigidProperties(b ? b : {});
            this.collisionEvents = [];
            this.parent = null;
            this.init_position = a.position.slice(0);
            this.init_rotation = a.rotation.slice(0);
            this.sceneObject = a;
            this.transform = new Ammo.btTransform();
            this.transform.setIdentity();
            this.transform.setOrigin(r(this.init_position));
            this.transform.setRotation(o(this.init_rotation));
            this.shape = null;
            this.motionState = new Ammo.btDefaultMotionState(this.transform);
            this.localInertia = new Ammo.btVector3(0, 0, 0);
            this.body = this.bodyInit = null;
        };
    u.prototype = {
        getProperties: function () {
            return this.properties;
        },
        getSceneObject: function () {
            return this.sceneObject;
        },
        getInitialPosition: function () {
            return this.init_position;
        },
        getInitialRotation: function () {
            return this.init_rotation;
        },
        setInitialPosition: function () {
            this.init_position = init_position_in;
        },
        setInitialRotation: function () {
            this.init_rotation = init_rotation_in;
        },
        getType: function () {
            return this.properties.type;
        },
        getMass: function () {
            return this.properties.mass;
        },
        getRestitution: function () {
            return this.properties.restitution;
        },
        getCollisionMap: function () {
            return this.properties.collision;
        },
        setMass: function (a) {
            this.properties.mass = a;
        },
        setRestitution: function (a) {
            this.restitution = a;
        },
        getBody: function () {
            if (!this.body) {
                var a = this.getCollisionShape();
                this.getMass() && a.calculateLocalInertia(this.getMass(), this.localInertia);
                this.bodyInit = new Ammo.btRigidBodyConstructionInfo(this.getMass(), this.motionState, a, this.localInertia);
                this.body = new Ammo.btRigidBody(this.bodyInit);
                this.getRestitution() && this.body.setRestitution(this.getRestitution());
            }
            return this.body;
        },
        updateSceneObject: function (c) {
            if (this.body && (this.body.isActive() || c))
                return (
                    this.body.getMotionState().getWorldTransform(a),
                    (c = a.getOrigin()),
                    c.x != c.x ? console.log("origin is NaN") : ((this.sceneObject.position[0] = c.x()), (this.sceneObject.position[1] = c.y()), (this.sceneObject.position[2] = c.z())),
                    (c = a.getRotation()),
                    (b.x = c.x()),
                    (b.y = c.y()),
                    (b.z = c.z()),
                    (b.w = c.w()),
                    b.x != b.x ? console.log("rotation is NaN") : ((c = b.toEuler()), (this.sceneObject.rotation[0] = c[0]), (this.sceneObject.rotation[1] = c[1]), (this.sceneObject.rotation[2] = c[2])),
                    !0
                );
        },
        reset: function () {
            var a = this.body.getWorldTransform().getOrigin();
            x(this.init_position, a);
            var a = this.body.getWorldTransform().getRotation(),
                d = this.init_rotation;
            b.fromEuler(d[0], d[1], d[2]);
            a.setX(this.init_rotation[0]);
            a.setY(this.init_rotation[1]);
            a.setZ(this.init_rotation[2]);
            a.setW(this.init_rotation[3]);
            x([0, 0, 0], c);
            this.body.setLinearVelocity(c);
            this.body.setAngularVelocity(c);
            this.body.activate();
        },
        getCollisionShape: function () {
            if (!this.shape) {
                var b;
                b = this.getCollisionMap();
                if (b.getResult()) b = b.getResult();
                else {
                    var c = b.getShapes(),
                        d,
                        h,
                        m,
                        q = [];
                    h = 0;
                    for (m = c.length; h < m; h++) {
                        d = c[h];
                        var v = null;
                        if (d.type === e.collision.shape.BOX) v = new Ammo.btBoxShape(new Ammo.btVector3(d.size[0] / 2, d.size[1] / 2, d.size[2] / 2));
                        else if (d.type === e.collision.shape.SPHERE) v = new Ammo.btSphereShape(d.radius);
                        else if (d.type === e.collision.shape.CAPSULE) v = new Ammo.btCapsuleShape(d.radius, d.height);
                        else if (d.type === e.collision.shape.CYLINDER) v = new Ammo.btCylinderShape(new Ammo.btVector3(d.size[0] / 2, d.size[1] / 2, d.size[2] / 2));
                        else if (d.type === e.collision.shape.CONE) v = new Ammo.btConeShape(d.radius, d.height);
                        else if (d.type === e.collision.shape.MESH) {
                            var v = d.mesh,
                                u = new Ammo.btTriangleMesh(),
                                z = d.size,
                                A = new Ammo.btVector3(0, 0, 0),
                                w = new Ammo.btVector3(0, 0, 0),
                                y = new Ammo.btVector3(0, 0, 0);
                            f = 0;
                            for (fMax = v.faces.length; f < fMax; f++) {
                                var x = v.faces[f];
                                x.points.length === 3 &&
                                    (A.setValue(v.points[x.points[0]][0] * z[0], v.points[x.points[0]][1] * z[1], v.points[x.points[0]][2] * z[2]),
                                    w.setValue(v.points[x.points[1]][0] * z[0], v.points[x.points[1]][1] * z[1], v.points[x.points[1]][2] * z[2]),
                                    y.setValue(v.points[x.points[2]][0] * z[0], v.points[x.points[2]][1] * z[1], v.points[x.points[2]][2] * z[2]),
                                    u.addTriangle(A, w, y));
                            }
                            this.getMass() === 0 || this.getType() == e.physics.body.STATIC ? (this.setMass(0), (v = new Ammo.btBvhTriangleMeshShape(u, !0))) : (v = new Ammo.btConvexTriangleMeshShape(u, !0));
                        } else d.type === e.collision.shape.HEIGHTFIELD && g();
                        v && (d.margin !== 0 && v.setMargin(d.margin), q.push({ cShape: d, btShape: v }));
                    }
                    c = null;
                    if (q.length === 1) c = q[0].btShape;
                    else if (q.length > 1) {
                        a = new Ammo.btTransform();
                        c = new Ammo.btCompoundShape(!1);
                        h = 0;
                        for (m = q.length; h < m; h++) a.setIdentity(), a.setOrigin(r(q[h].cShape.position)), a.setRotation(o(q[h].cShape.rotation)), c.addChildShape(a, q[h].btShape);
                    }
                    b.setResult(c);
                    b = c;
                }
                this.shape = b;
            }
            return this.shape;
        },
        setAngularVelocity: function (a) {
            this.body && (x(a, c), this.body.setAngularVelocity(c));
        },
        setLinearVelocity: function (a) {
            this.body && (x(a, c), this.body.setLinearVelocity(c));
        },
        getAngularVelocity: function () {
            return q(this.body.getAngularVelocity());
        },
        getLinearVelocity: function () {
            return q(this.body.getLinearVelocity());
        },
        activate: function () {
            this.body && this.body.activate();
        },
    };
    var h = function (a) {
        a = a || {};
        this.ctype = a.ctype || e.physics.constraint.P2P;
        this.strength = a.strength || 0.1;
        this.maxImpulse = a.maxImpulse || 0;
        this.rigidBodyA = a.rigidBodyA || a.rigidBody || null;
        this.rigidBodyB = a.rigidBodyB || null;
        this.positionA = a.positionA || [0, 0, 0];
        this.positionB = a.positionB || a.position || [0, 0, 0];
        this.btConstraint = null;
        this.localPivotA = r(this.positionA);
        this.localPivotB = r(this.positionB);
    };
    h.prototype = {
        getConstraint: function () {
            if (!this.btConstraint) {
                if (!this.rigidBodyA) return !1;
                if (
                    this.ctype === e.physics.constraint.P2P &&
                    ((this.btConstraint =
                        this.rigidBodyA && this.rigidBodyB
                            ? new Ammo.btPoint2PointConstraint(this.rigidBodyA.getBody(), this.rigidBodyB.getBody(), this.localPivotA, this.localPivotB)
                            : new Ammo.btPoint2PointConstraint(this.rigidBodyA.getBody(), this.localPivotA)),
                    this.btConstraint.get_m_setting().set_m_tau(this.strength),
                    this.maxImpulse && this.btConstraint.get_m_setting().set_m_impulseClamp(this.maxImpulse),
                    this.btConstraint === NULL)
                )
                    this.btConstraint = null;
            }
            return this.btConstraint;
        },
        setStrength: function (a) {
            this.strength = a;
            this.btConstraint && this.btConstraint.get_m_setting().set_m_tau(this.strength);
        },
        setMaxImpulse: function (a) {
            this.maxImpulse = a;
            this.btConstraint && this.btConstraint.get_m_setting().set_impulseClamp(this.maxImpulse);
        },
        getStrength: function () {
            return this.strength;
        },
        setPosition: function (a) {
            this.positionB = a;
            this.btConstraint && (x(this.positionB, this.localPivotB), this.btConstraint.setPivotB(this.localPivotB));
        },
        getPosition: function () {
            return this.positionB;
        },
    };
    var d = function () {
        this.rigidObjects = [];
        this.active_count = 0;
        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
        this.overlappingPairCache = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration);
        this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
        if (!a || !b) (c = new Ammo.btVector3()), (a = new Ammo.btTransform()), (b = new CubicVR.Quaternion());
    };
    d.prototype = {
        addConstraint: function (a) {
            var b = a.getConstraint();
            if (b) return this.dynamicsWorld.addConstraint(b), a.rigidBodyA.getBody().setActivationState(Ammo.DISABLE_DEACTIVATION), a.rigidBodyA.getBody().activate(), !0;
            return !1;
        },
        removeConstraint: function (a) {
            if ((a = a.getConstraint())) return this.dynamicsWorld.removeConstraint(a), !0;
            return !1;
        },
        setGravity: function (a) {
            x(a, c);
            this.dynamicsWorld.setGravity(c);
        },
        bindSceneObject: function (a, b) {
            var c = new CubicVR.RigidBody(a, b);
            this.rigidObjects.push(c);
            c.getBody().activate();
            this.dynamicsWorld.addRigidBody(c.getBody());
            c.updateSceneObject(!0);
            return c;
        },
        bindRigidBody: function (a) {
            if (this.rigidObjects.indexOf(a) === -1) {
                this.rigidObjects.push(a);
                var b = a.getBody();
                b.activate();
                this.dynamicsWorld.addRigidBody(b);
                a.updateSceneObject(!0);
            }
        },
        getActiveCount: function () {
            return this.active_count;
        },
        stepSimulation: function (a, b) {
            this.dynamicsWorld.stepSimulation(a, b || 2);
            for (var c = 0, d = 0, e = this.rigidObjects.length; d < e; d++) this.rigidObjects[d].updateSceneObject() && c++;
            this.active_count = c;
        },
        reset: function () {
            for (var a = 0, b = this.rigidObjects.length; a < b; a++) this.rigidObjects[a].reset();
        },
        getRayHit: function (a, b, c, d) {
            var e,
                a = r(a);
            e = r(b);
            c = c || !1;
            d = d || !1;
            b = new Ammo.ClosestRayResultCallback(a, e);
            this.dynamicsWorld.rayTest(a, e, b);
            if (b.hasHit() && ((body = Ammo.btRigidBody.prototype.upcast(b.get_m_collisionObject())), body !== NULL && !((body.isStaticObject() && !c) || (body.isKinematicObject() && !d)))) {
                d = body;
                c = b.get_m_hitPointWorld();
                a = 0;
                for (b = this.rigidObjects.length; a < b; a++)
                    if (Ammo.compare(this.rigidObjects[a].body, d)) return (d = this.rigidObjects[a]), (a = this.rigidObjects[a].body.getCenterOfMassTransform().inverse().op_mul(c)), { position: q(c), localPosition: q(a), rigidBody: d };
            }
        },
    };
    return {
        ScenePhysics: d,
        Constraint: h,
        RigidProperties: function (a) {
            this.type = a.type !== m ? a.type : e.physics.body.DYNAMIC;
            this.mass = a.mass !== m ? a.mass : this.type ? 1 : 0;
            this.size = a.size || [1, 1, 1];
            this.restitution = a.restitution || (this.type ? 0 : 1);
            this.friction = a.friction || 1;
            if ((this.collision = a.collision) && !this.collision.getShapes) this.collision = new CubicVR.CollisionMap(this.collision);
        },
        RigidBody: u,
    };
});
CubicVR.RegisterModule("Shader", function (u) {
    function x(a, b) {
        var c = CubicVR.util,
            h,
            d;
        this.uniforms = [];
        this.uniform_type = [];
        this.uniform_typelist = [];
        a.indexOf("\n") !== -1 ? (h = e(o.gl, a, "x-shader/x-vertex")) : ((h = g(o.gl, a)), h === null && ((d = c.getURL(a)), (h = e(o.gl, d, "x-shader/x-vertex"))));
        b.indexOf("\n") !== -1 ? (d = e(o.gl, b, "x-shader/x-fragment")) : ((d = g(o.gl, b)), d === null && ((d = c.getURL(b)), (d = e(o.gl, d, "x-shader/x-fragment"))));
        this.shader = o.gl.createProgram();
        o.gl.attachShader(this.shader, h);
        o.gl.attachShader(this.shader, d);
        o.gl.linkProgram(this.shader);
        if (!o.gl.getProgramParameter(this.shader, o.gl.LINK_STATUS)) throw Error("Could not initialise shader vert(" + a + "), frag(" + b + ")");
    }
    var r = u.undef,
        o = u.GLCore,
        q = CubicVR.enums,
        m = u.log;
    q.shader = { map: { COLOR: 1, SPECULAR: 2, NORMAL: 4, BUMP: 8, REFLECT: 16, ENVSPHERE: 32, AMBIENT: 64, ALPHA: 128 }, uniform: { MATRIX: 0, VECTOR: 1, FLOAT: 2, ARRAY_VERTEX: 3, ARRAY_UV: 4, ARRAY_FLOAT: 5, INT: 6 } };
    var e = function (a, b, c) {
            if (c === "x-shader/x-fragment") c = a.createShader(a.FRAGMENT_SHADER);
            else if (c === "x-shader/x-vertex") c = a.createShader(a.VERTEX_SHADER);
            else return null;
            a.shaderSource(c, b);
            a.compileShader(c);
            if (!a.getShaderParameter(c, a.COMPILE_STATUS)) return m(a.getShaderInfoLog(c)), null;
            return c;
        },
        g = function (a, b) {
            var c = document.getElementById(b);
            if (!c) return null;
            for (var e = "", d = c.firstChild; d; ) d.nodeType === 3 && (e += d.textContent), (d = d.nextSibling);
            if (c.type === "x-shader/x-fragment") c = a.createShader(a.FRAGMENT_SHADER);
            else if (c.type === "x-shader/x-vertex") c = a.createShader(a.VERTEX_SHADER);
            else return null;
            a.shaderSource(c, e);
            a.compileShader(c);
            a.getShaderParameter(c, a.COMPILE_STATUS) || m(a.getShaderInfoLog(c));
            return c;
        };
    x.prototype = {
        bindSelf: function (a) {
            var b, c, e;
            a.indexOf(".") !== -1
                ? a.indexOf("[") !== -1
                    ? ((b = a.split("[")), (e = b[0]), (b = b[1].split("]")), (c = b[0]), (b = b[1].split(".")), (b = b[1]), this[e] === r && (this[e] = []), this[e][c] === r && (this[e][c] = {}), (this[e][c][b] = this.uniforms[a]))
                    : ((b = a.split(".")), (e = b[0]), (b = b[1]), this[e] === r && (this[e] = {}), (this[e][b] = this.uniforms[a]))
                : a.indexOf("[") !== -1
                ? ((b = a.split("[")), (e = b[0]), (b = b[1].split("]")), (c = b[0]), this[e] === r && (this[e] = []), (this[e][c] = this.uniforms[a]))
                : (this[a] = this.uniforms[a]);
        },
        addMatrix: function (a, b) {
            this.use();
            this.uniforms[a] = o.gl.getUniformLocation(this.shader, a);
            this.uniform_type[a] = q.shader.uniform.MATRIX;
            this.uniform_typelist.push([this.uniforms[a], this.uniform_type[a]]);
            b !== r && this.setMatrix(a, b);
            this.bindSelf(a);
            return this.uniforms[a];
        },
        addVector: function (a, b) {
            this.use();
            this.uniforms[a] = o.gl.getUniformLocation(this.shader, a);
            this.uniform_type[a] = q.shader.uniform.VECTOR;
            this.uniform_typelist.push([this.uniforms[a], this.uniform_type[a]]);
            b !== r && this.setVector(a, b);
            this.bindSelf(a);
            return this.uniforms[a];
        },
        addFloat: function (a, b) {
            this.use();
            this.uniforms[a] = o.gl.getUniformLocation(this.shader, a);
            this.uniform_type[a] = q.shader.uniform.FLOAT;
            this.uniform_typelist.push([this.uniforms[a], this.uniform_type[a]]);
            b !== r && this.setFloat(a, b);
            this.bindSelf(a);
            return this.uniforms[a];
        },
        addVertexArray: function (a) {
            this.use();
            this.uniforms[a] = o.gl.getAttribLocation(this.shader, a);
            this.uniform_type[a] = q.shader.uniform.ARRAY_VERTEX;
            this.uniform_typelist.push([this.uniforms[a], this.uniform_type[a]]);
            this.bindSelf(a);
            return this.uniforms[a];
        },
        addUVArray: function (a) {
            this.use();
            this.uniforms[a] = o.gl.getAttribLocation(this.shader, a);
            this.uniform_type[a] = q.shader.uniform.ARRAY_UV;
            this.uniform_typelist.push([this.uniforms[a], this.uniform_type[a]]);
            this.bindSelf(a);
            return this.uniforms[a];
        },
        addFloatArray: function (a) {
            this.use();
            this.uniforms[a] = o.gl.getAttribLocation(this.shader, a);
            this.uniform_type[a] = q.shader.uniform.ARRAY_FLOAT;
            this.uniform_typelist.push([this.uniforms[a], this.uniform_type[a]]);
            this.bindSelf(a);
            return this.uniforms[a];
        },
        addInt: function (a, b) {
            this.use();
            this.uniforms[a] = o.gl.getUniformLocation(this.shader, a);
            this.uniform_type[a] = q.shader.uniform.INT;
            this.uniform_typelist.push([this.uniforms[a], this.uniform_type[a]]);
            b !== r && this.setInt(a, b);
            this.bindSelf(a);
            return this.uniforms[a];
        },
        use: function () {
            o.gl.useProgram(this.shader);
        },
        setMatrix: function (a, b) {
            var c = this.uniforms[a];
            if (c !== null) {
                var e = b.length;
                e === 16 ? o.gl.uniformMatrix4fv(c, !1, b) : e === 9 ? o.gl.uniformMatrix3fv(c, !1, b) : e === 4 && o.gl.uniformMatrix2fv(c, !1, b);
            }
        },
        setInt: function (a, b) {
            var c = this.uniforms[a];
            c !== null && o.gl.uniform1i(c, b);
        },
        setFloat: function (a, b) {
            var c = this.uniforms[a];
            c !== null && o.gl.uniform1f(c, b);
        },
        setVector: function (a, b) {
            var c = this.uniforms[a];
            if (c !== null) {
                var e = b.length;
                e == 3 ? o.gl.uniform3fv(c, b) : e == 2 ? o.gl.uniform2fv(c, b) : o.gl.uniform4fv(c, b);
            }
        },
        clearArray: function (a) {
            a = this.uniforms[a];
            a !== null && o.gl.disableVertexAttribArray(a);
        },
        bindArray: function (a, b) {
            var c = o.gl,
                e = this.uniforms[a];
            if (e !== null) {
                var d = this.uniform_type[a];
                d === q.shader.uniform.ARRAY_VERTEX
                    ? (c.bindBuffer(c.ARRAY_BUFFER, b), c.vertexAttribPointer(e, 3, c.FLOAT, !1, 0, 0), c.enableVertexAttribArray(e))
                    : d === q.shader.uniform.ARRAY_UV
                    ? (c.bindBuffer(c.ARRAY_BUFFER, b), c.vertexAttribPointer(e, 2, c.FLOAT, !1, 0, 0))
                    : d === q.shader.uniform.ARRAY_FLOAT && (c.bindBuffer(c.ARRAY_BUFFER, b), c.vertexAttribPointer(e, 1, c.FLOAT, !1, 0, 0));
            }
        },
    };
    return { Shader: x };
});
CubicVR.RegisterModule("UVMapper", function (u) {
    function x(a) {
        a !== r
            ? ((this.rotation = a.rotation === r ? [0, 0, 0] : a.rotation),
              (this.scale = a.scale === r ? [1, 1, 1] : a.scale),
              (this.center = a.center === r ? [0, 0, 0] : a.center),
              (this.projection_mode = a.projectionMode === r ? o.uv.projection.PLANAR : a.projectionMode),
              (this.projection_axis = a.projectionAxis === r ? o.uv.axis.X : a.projectionAxis),
              (this.wrap_w_count = a.wrapW === r ? 1 : a.wrapW),
              (this.wrap_h_count = a.wrapH === r ? 1 : a.wrapH))
            : ((this.rotation = [0, 0, 0]), (this.scale = [1, 1, 1]), (this.center = [0, 0, 0]), (this.projection_mode = o.uv.projection.PLANAR), (this.projection_axis = o.uv.axis.X), (this.wrap_h_count = this.wrap_w_count = 1));
    }
    var r = u.undef,
        o = CubicVR.enums,
        q = 2 * Math.PI,
        m = Math.PI / 2;
    o.uv = { axis: { X: 0, Y: 1, Z: 2 }, projection: { UV: 0, PLANAR: 1, CYLINDRICAL: 2, SPHERICAL: 3, CUBIC: 4, SKY: 5 } };
    var e = function (a, b, c) {
            return a === 0 && c === 0 ? 0 : c === 0 ? (a < 0 ? m : -m) : c < 0 ? -Math.atan(a / c) + Math.PI : -Math.atan(a / c);
        },
        g = function (a, b, c) {
            var e;
            a === 0 && c === 0
                ? ((e = 0), (a = b !== 0 ? (b < 0 ? -m : m) : 0))
                : ((e = c === 0 ? (a < 0 ? m : -m) : c < 0 ? -Math.atan(a / c) + Math.PI : -Math.atan(a / c)), (a = Math.sqrt(a * a + c * c)), (a = a === 0 ? (b < 0 ? -m : m) : Math.atan(b / a)));
            return [e, a];
        };
    x.prototype = {
        setRotation: function (a) {
            this.rotation = a;
        },
        setScale: function (a) {
            this.scale = a;
        },
        setCenter: function (a) {
            this.center = a;
        },
        setProjectionAxis: function (a) {
            this.projection_axis = a;
        },
        setProjectionMode: function (a) {
            this.projection_mode = a;
        },
        setWrapW: function (a) {
            this.wrap_w_count = a;
        },
        setWrapH: function (a) {
            this.wrap_h_count = a;
        },
        apply: function (a, b, c, h, d) {
            var n = CubicVR.mat4,
                t,
                s,
                u,
                x,
                L,
                v = new CubicVR.Transform(),
                D = !1,
                z = null;
            if (this.center[0] || this.center[1] || this.center[2]) v.translate(-this.center[0], -this.center[1], -this.center[2]), (D = !0);
            if (this.rotation[0] || this.rotation[1] || this.rotation[2])
                this.rotation[0] && v.rotate(this.rotation[2], 0, 0, 1), this.rotation[1] && v.rotate(this.rotation[1], 0, 1, 0), this.rotation[2] && v.rotate(this.rotation[0], 1, 0, 0), (D = !0);
            D && (z = v.getResult());
            typeof b === "object" && (b = a.materials.indexOf(b));
            var v = 0,
                A = a.faces.length;
            h && (v = h);
            for (d && (A = d + 1); v < A; v++)
                if (a.faces[v].material === b && !(c !== r && a.faces[v].segment !== c)) {
                    var w, y, R;
                    if (this.projection_mode === o.uv.projection.CUBIC || this.projection_mode === o.uv.projection.SKY) (w = Math.abs(a.faces[v].normal[0])), (y = Math.abs(a.faces[v].normal[1])), (R = Math.abs(a.faces[v].normal[2]));
                    for (var h = [], d = 0, B = a.faces[v].points.length; d < B; d++) {
                        s = a.faces[v].points[d];
                        var E = a.faces[v].points[(d + 1) % 3],
                            P = a.faces[v].points[(d + 2) % 3];
                        t = a.points[s];
                        var J = a.points[E],
                            I = a.points[P],
                            F;
                        D && (t = n.vec3_multiply(t, z));
                        F = this.projection_mode;
                        if (F === o.uv.projection.SKY)
                            (s = a.sky_mapping),
                                w >= y &&
                                    w >= R &&
                                    ((u = t[2] / this.scale[2] + this.scale[2] / 2),
                                    (x = -t[1] / this.scale[1] + this.scale[1] / 2),
                                    a.faces[v].normal[0] < 0
                                        ? ((u = (s[2][2] - s[2][0]) * (1 - u)), (x = 1 - (s[2][3] - s[2][1]) * x), (u += s[2][0]), (x += s[2][1]))
                                        : ((u *= s[3][2] - s[3][0]), (x = 1 - (s[3][3] - s[3][1]) * x), (u += s[3][0]), (x += s[3][1]))),
                                y >= w &&
                                    y >= R &&
                                    ((u = t[0] / this.scale[0] + this.scale[0] / 2),
                                    (x = -t[2] / this.scale[2] + this.scale[2] / 2),
                                    a.faces[v].normal[1] < 0
                                        ? ((u *= s[1][2] - s[1][0]), (x = 1 - (s[1][3] - s[1][1]) * x), (u += s[1][0]), (x -= s[1][1]))
                                        : ((u *= s[0][2] - s[0][0]), (x = 1 - (s[0][3] - s[0][1]) * x), (u += s[0][0]), (x -= s[0][1]))),
                                R >= w &&
                                    R >= y &&
                                    ((u = t[0] / this.scale[0] + this.scale[0] / 2),
                                    (x = t[1] / this.scale[1] + this.scale[1] / 2),
                                    a.faces[v].normal[2] < 0
                                        ? ((u *= s[4][2] - s[4][0]), (x = 1 - (s[4][3] - s[4][1]) * (1 - x)), (u += s[4][0]), (x -= s[4][1]))
                                        : ((u = (s[5][2] - s[5][0]) * (1 - u)), (x = 1 - (s[5][3] - s[5][1]) * (1 - x)), (u += s[5][0]), (x += s[5][1]))),
                                a.faces[v].setUV([u, x], d);
                        else if (F === o.uv.projection.CUBIC)
                            w >= y && w >= R && ((u = t[2] / this.scale[2] + 0.5), (x = t[1] / this.scale[1] + 0.5)),
                                y >= w && y >= R && ((u = -t[0] / this.scale[0] + 0.5), (x = t[2] / this.scale[2] + 0.5)),
                                R >= w && R >= y && ((u = -t[0] / this.scale[0] + 0.5), (x = t[1] / this.scale[1] + 0.5)),
                                a.faces[v].normal[0] > 0 && (u = -u),
                                a.faces[v].normal[1] < 0 && (u = -u),
                                a.faces[v].normal[2] > 0 && (u = -u),
                                a.faces[v].setUV([u, x], d);
                        else if (F === o.uv.projection.PLANAR)
                            (u = this.projection_axis === o.uv.axis.X ? t[2] / this.scale[2] + 0.5 : -t[0] / this.scale[0] + 0.5),
                                (x = this.projection_axis === o.uv.axis.Y ? t[2] / this.scale[2] + 0.5 : t[1] / this.scale[1] + 0.5),
                                a.faces[v].setUV([u, x], d);
                        else {
                            if (F === o.uv.projection.CYLINDRICAL)
                                (F = this.projection_axis),
                                    F === o.uv.axis.X
                                        ? ((L = e(t[2], t[0], -t[1])), (x = -t[0] / this.scale[0] + 0.5))
                                        : F === o.uv.axis.Y
                                        ? ((L = e(-t[0], t[1], t[2])), (x = -t[1] / this.scale[1] + 0.5))
                                        : F === o.uv.axis.Z && ((L = e(-t[0], t[2], -t[1])), (x = -t[2] / this.scale[2] + 0.5)),
                                    (L = 1 - L / q),
                                    this.wrap_w_count !== 1 && (L *= this.wrap_w_count),
                                    (t = L),
                                    (s = x);
                            else if (F === o.uv.projection.SPHERICAL) {
                                var G, O, K;
                                F = this.projection_axis;
                                F === o.uv.axis.X
                                    ? ((G = h[s] ? h[s] : g(t[2], t[0], -t[1])), h[s] || (h[s] = G), (O = h[E] ? h[E] : g(J[2], J[0], -J[1])), h[E] || (h[E] = O), (K = h[P] ? h[P] : g(I[2], I[0], -I[1])), h[P] || (h[P] = K))
                                    : F === o.uv.axis.Y
                                    ? ((G = h[s] ? h[s] : g(t[0], -t[1], t[2])), h[s] || (h[s] = G), (O = h[E] ? h[E] : g(J[0], -J[1], J[2])), h[E] || (h[E] = O), (K = h[P] ? h[P] : g(I[0], -I[1], I[2])), h[P] || (h[P] = K))
                                    : F === o.uv.axis.Z &&
                                      ((G = h[s] ? h[s] : g(-t[0], t[2], -t[1])), h[s] || (h[s] = G), (O = h[E] ? h[E] : g(-J[0], J[2], -J[1])), h[E] || (h[E] = O), (K = h[P] ? h[P] : g(-I[0], I[2], -I[1])), h[P] || (h[P] = K));
                                Math.abs(G[0] - O[0]) > m && Math.abs(G[0] - K[0]) > m && (G[0] > O[0] && G[0] > K[0] ? (G[0] -= q) : (G[0] += q));
                                Math.abs(G[1] - O[1]) > m && Math.abs(G[1] - K[1]) > m && (G[1] > O[1] && G[1] > K[1] ? (G[1] -= q) : (G[1] += q));
                                L = 1 - G[0] / q;
                                s = 0.5 - G[1] / Math.PI;
                                this.wrap_w_count !== 1 && (L *= this.wrap_w_count);
                                this.wrap_h_count !== 1 && (s *= this.wrap_h_count);
                                t = L;
                            } else s = t = 0;
                            a.faces[v].setUV([t, s], d);
                        }
                    }
                }
            return this;
        },
    };
    return { UVMapper: x };
});
CubicVR.RegisterModule("Utility", function (u) {
    var x = u.undef;
    return {
        util: {
            getScriptContents: function (r) {
                var o = document.getElementById(r),
                    q = "",
                    m = "";
                if (o) {
                    if (o.src !== "" || o.attributes.srcUrl !== x) m = o.src !== "" ? o.src : o.attributes.srcUrl.value;
                } else m = r;
                if (m.length !== 0) {
                    if (((r = new XMLHttpRequest()), r.open("GET", m, !1), r.send(null), r.status === 200 || r.status === 0)) q = r.responseText;
                } else for (m = o.firstChild; m; ) m.nodeType === 3 && (q += m.textContent), (m = m.nextSibling);
                return q;
            },
            getURL: function (r) {
                try {
                    var o = new XMLHttpRequest();
                    o.open("GET", r, !1);
                    o.send(null);
                    if (o.status === 200 || o.status === 0)
                        if (o.responseText.length) return o.responseText;
                        else if (o.responseXML) return o.responseXML;
                } catch (q) {
                    alert(r + " failed to load.");
                }
                return null;
            },
            getXML: function (r) {
                try {
                    var o = new XMLHttpRequest();
                    o.open("GET", r, !1);
                    o.overrideMimeType("application/xml");
                    o.send(null);
                    if (o.status === 200 || o.status === 0) return o.responseXML;
                } catch (q) {
                    try {
                        alert(r + " failed to load.");
                    } catch (m) {
                        throw q;
                    }
                }
                return null;
            },
            getJSON: function (r) {
                try {
                    var o = new XMLHttpRequest();
                    o.open("GET", r, !1);
                    o.overrideMimeType("application/json");
                    o.send(null);
                    if (o.status === 200 || o.status === 0) return eval("(" + o.responseText + ")");
                } catch (q) {
                    try {
                        alert(r + " failed to load.");
                    } catch (m) {
                        throw q;
                    }
                }
                return null;
            },
            repackArray: function (r, o, q) {
                r.length !== parseInt(o, 10) * parseInt(q, 10) && log("array repack error, data size !== stride*count: data.length=" + r.length + " stride=" + o + " count=" + q);
                for (var q = [], m = 0, e = 0, g = r.length; e < g; e++) {
                    var a = e % o;
                    a === 0 && (q[m] = []);
                    q[m][a] = r[e];
                    a === o - 1 && m++;
                }
                return q;
            },
            collectTextNode: function (r) {
                if (!r) return "";
                for (var o = "", r = r.childNodes, q = 0, m = r.length; q < m; q++) o += r[q].nodeValue;
                return o;
            },
            floatDelimArray: function (r, o) {
                for (var q = r.split(o ? o : ","), m = 0, e = q.length; m < e; m++) q[m] = parseFloat(q[m]);
                q[q.length - 1] !== q[q.length - 1] && q.pop();
                return q;
            },
            intDelimArray: function (r, o) {
                for (var q = r.split(o ? o : ","), m = 0, e = q.length; m < e; m++) q[m] = parseInt(q[m], 10);
                q[q.length - 1] !== q[q.length - 1] && q.pop();
                return q;
            },
            textDelimArray: function (r, o) {
                for (var q = r.split(o ? o : ","), m = 0, e = q.length; m < e; m++) q[m] = q[m];
                return q;
            },
            xml2badgerfish: function (r) {
                var o = {},
                    q = [],
                    m,
                    e,
                    g,
                    a,
                    b,
                    c = /^\s+|\s+$/g;
                r.jsonParent = o;
                for (q.push(r); q.length; ) {
                    e = q.pop();
                    var h = null;
                    g = e.jsonParent;
                    r = 0;
                    for (m = e.childNodes.length; r < m; r++) (a = e.childNodes[r]), (b = a.tagName), b !== x && ((h = h || {}), (h[b] = h[b] || 0), h[b]++);
                    if (e.attributes && e.attributes.length) {
                        r = 0;
                        for (m = e.attributes.length; r < m; r++) (a = e.attributes[r]), (g["@" + a.name] = a.value);
                    }
                    r = 0;
                    for (m = e.childNodes.length; r < m; r++)
                        if (((a = e.childNodes[r]), (b = a.tagName), a.nodeType === 1)) h[b] > 1 ? ((g[b] = g[b] || []), g[b].push({}), (a.jsonParent = g[b][g[b].length - 1])) : ((g[b] = g[b] || {}), (a.jsonParent = g[b])), q.push(a);
                        else if (a.nodeType === 3 && a.nodeValue.replace(c, "") !== "") (g.$ = g.$ || ""), (g.$ += a.nodeValue);
                }
                return o;
            },
        },
    };
});
CubicVR.RegisterModule("Worker", function (u) {
    function x(a) {
        var b = this;
        this.message = a.message || function () {};
        this.send = function (a, b) {
            postMessage({ message: a, data: b });
        };
        self.addEventListener(
            "message",
            function (a) {
                a.data.message !== "init" && b.message(a.data);
            },
            !1
        );
    }
    function r(a) {
        function b(a) {
            setTimeout(function () {
                c.send("test", a);
            }, 1e3);
        }
        a && b(a);
        var c = new x({ message: b });
    }
    function o(a) {
        function b(a) {
            a = s.getURL(a);
            c.send("done", a.length);
        }
        var c;
        c = new x({
            message: function (a) {
                b(a);
            },
        });
        a && b(a);
    }
    function q(a) {
        function b(a) {
            a = s.getURL(a);
            c.send("loaded", a);
        }
        var c, d;
        c = new x({
            message: function (a) {
                if (a.message === "parse") (d = new t()), CubicVR.loadCollada("", "", d, a.data), c.send("parsed");
                else if (a.message === "getMesh") {
                    if ((a = d.meshMap[":" + a.data])) {
                        var b = a.triangulateQuads().compileVBO(a.compileMap());
                        c.send("getMesh", { mesh: a, vbo: b });
                    }
                } else throw Error("Not a SceneFileWorker command: " + a.message);
            },
        });
        a && b(a);
    }
    function m(b) {
        function c(b) {
            var e = new a(),
                g;
            for (g in b) b.hasOwnProperty(g) && (e[g] = b[g]);
            b = e.triangulateQuads().compileVBO(e.compileMap());
            d.send("done", b);
        }
        var d;
        d = new x({
            message: function (a) {
                c(a);
            },
        });
        b && c(b);
    }
    try {
        if (!window) (self.window = self), (self.document = {}), (self.fakeWindow = !0), (self.console = { log: function () {} });
    } catch (e) {
        (self.window = self), (self.document = {}), (self.fakeWindow = !0), (self.console = { log: function () {} });
    }
    var g = u.undef,
        a = CubicVR.Mesh,
        b = CubicVR.Texture,
        c = CubicVR.Material,
        h = CubicVR.SceneObject,
        d = CubicVR.Motion,
        n = CubicVR.Envelope,
        t = CubicVR.DeferredBin,
        s = CubicVR.util;
    return {
        Worker: function (a) {
            this.worker = new Worker(CubicVR.getScriptLocation() + "CubicVR.js");
            this.message = a.message || function () {};
            this.error =
                a.error ||
                function (a) {
                    console.log("Error: " + a.message + ": " + a.lineno);
                };
            this.type = a.type;
            var b = this;
            this.worker.onmessage = function (a) {
                b.message(a.data);
            };
            this.worker.onerror = function (a) {
                b.error(a);
            };
            this.init = function (a) {
                b.send("init", { type: b.type, data: a });
            };
            this.send = function (a, c) {
                b.worker.postMessage({ message: a, data: c });
            };
            this.send("CubicVR_InitWorker", CubicVR.getScriptLocation());
            (a.data || a.autoStart) && b.init(a.data);
        },
        ResourcePool: function () {
            function d(b) {
                var c = b.parsed || function () {},
                    e = {},
                    g;
                b.url.match(/\.dae/) &&
                    (g = new CubicVR.Worker({
                        type: "sceneFile",
                        data: b.url,
                        message: function (b) {
                            if (b.message === "loaded") {
                                var b = new DOMParser().parseFromString(b.data, "text/xml"),
                                    d = s.xml2badgerfish(b);
                                console.log(b);
                                g.send("parse", d);
                            } else if (b.message === "getMesh") {
                                var d = new a(),
                                    h;
                                for (h in b.data.mesh) b.data.mesh.hasOwnProperty(h) && (d[h] = b.data.mesh[h]);
                                d.bindBuffer(d.bufferVBO(b.data.vbo));
                                e.getMesh && e.getMesh(d);
                            } else b.message === "parsed" && c();
                        },
                    }));
                this.getSceneObject = function (a, b) {
                    g.send("getMesh", a);
                    e.getMesh = b;
                };
            }
            function e(a, b) {
                for (var c in a) a.hasOwnProperty(c) && (b[c] = a[c]);
                return b;
            }
            var g = this,
                m = {};
            this.createSceneFileManager = function (a) {
                var b = new d({ url: a.url, parsed: a.parsed });
                return (m[a.url] = b);
            };
            this.removeSceneFileManager = function (a) {
                if (typeof settings === "string") delete m[settings];
                else for (var b in m) m[b] === a && delete m[b];
            };
            this.createSceneObjectFromMesh = function (d) {
                var m = d.scene,
                    n = d.object,
                    o = d.assetBase || "",
                    q = g.createSceneFileManager({
                        url: d.mesh,
                        parsed: function () {
                            n &&
                                q.getSceneObject(n, function (d) {
                                    for (var d = e(d, new a()), g = 0, n = d.materials.length; g < n; ++g) {
                                        for (var q = e(d.materials[g], new c()), r = 0, s = q.textures.length; r < s; ++r) {
                                            var t = q.textures[g];
                                            q.textures[g] = new b(o + t.img_path, t.filter_type);
                                        }
                                        d.materials[g] = q;
                                    }
                                    d = new h(d);
                                    m.bindSceneObject(d);
                                });
                        },
                    });
            };
            this.loadFile = function (a, b) {
                b = b || function () {};
                new CubicVR.Worker({
                    type: "file",
                    data: mesh,
                    message: function (a) {
                        b(a.data);
                    },
                });
            };
        },
        loadColladaWorker: function (e, m, o, q) {
            var r;
            try {
                r = new Worker(CubicVR.getScriptLocation() + "collada.js");
            } catch (s) {
                throw Error("Can't find collada.js");
            }
            var t = [],
                u = [];
            r.onmessage = function (m) {
                function r(a, b) {
                    for (var c in a) b[c] = a[c];
                }
                function s(a) {
                    if (a.motion) {
                        for (var b = a.motion.controllers, c = [], e = 0, g = b.length; e < g; ++e) {
                            var h = b[e];
                            if (h) {
                                for (var m = [], o = 0, q = h.length; o < q; ++o) {
                                    var t = h[o];
                                    if (t) {
                                        var u = t.keys[0];
                                        if (t.keys.length > 1) (u.prev = null), (u.next = t.keys[1]), (u = t.keys[1]);
                                        for (var v = 1, w = t.keys.length - 1; v < w; ++v) (u.prev = t.keys[v - 1]), (u.next = t.keys[v + 1]), (u = t.keys[v + 1]);
                                        if (t.keys.length > 1) (u = t.keys[t.keys.length - 1]), (u.prev = t.keys[t.keys.length - 2]), (u.next = null);
                                        t.firstKey = t.keys[0];
                                        t.lastKey = t.keys[t.keys.length - 1];
                                        t.keys = t.firstKey;
                                        u = new n();
                                        r(t, u);
                                        m[o] = u;
                                    } else h[o] = null;
                                }
                                c[e] = m;
                            } else b[e] = null;
                        }
                        a.motion.controllers = c;
                        b = new d();
                        r(a.motion, b);
                        a.motion = b;
                    }
                }
                function x(b) {
                    var c = new h();
                    r(b, c);
                    if (b.obj !== null) {
                        var d = u[b.obj.id];
                        if (d === g)
                            if (((d = new a()), r(b.obj, d), (c.obj = d), (u[b.obj.id] = d), q)) {
                                if (d.points.length > 0) {
                                    q.addMesh(e, e + ":" + d.id, d);
                                    for (var m = 0, n = d.faces.length; m < n; ++m) {
                                        var o = d.faces[m],
                                            s = o.material;
                                        o.material = t[s] !== g ? t[s] : 0;
                                    }
                                }
                            } else c.obj.triangulateQuads(), c.obj.calcNormals(), c.obj.compile(), c.obj.clean();
                        else c.obj = d;
                    }
                    c.trans = new Transform();
                    if (b.children && b.children.length > 0 && ((c.children = []), b.children)) {
                        d = 0;
                        for (m = b.children.length; d < m; ++d) (n = x(b.children[d])), c.bindChild(n);
                    }
                    return c;
                }
                var z;
                z = m.data.message;
                if (z == "materials") {
                    var C = JSON.parse(m.data.data),
                        m = 0;
                    for (z = C.length; m < z; ++m) {
                        var D = new c(C[m].name),
                            F = D.material_id;
                        r(C[m], D);
                        D.material_id = F;
                        t[C[m].material_id] = F;
                        for (var F = 0, G = C[m].textures.length; F < G; ++F) {
                            var O = C[m].textures[F];
                            if (O) {
                                var K = Texture_ref[O.img_path];
                                K === g ? ((O = new b(O.img_path, O.filter_type, q, e)), (D.textures[F] = O)) : (D.textures[F] = Textures_obj[K]);
                            } else D.textures[F] = 0;
                        }
                    }
                } else if (z == "scene") {
                    C = JSON.parse(m.data.data);
                    m = 0;
                    for (z = C.sceneObjects.length; m < z; ++m) {
                        D = C.sceneObjects[m];
                        D.obj !== null && nop();
                        if (D.reassembled === g) s(D), (D.reassembled = !0);
                        C.sceneObjects[m] = x(D);
                    }
                    D = new Scene();
                    m = D.camera;
                    z = m.transform;
                    r(C.camera, m);
                    r(C.camera.transform, z);
                    s(m);
                    D.camera = m;
                    D.camera.transform = z;
                    D.camera.frustum = new Frustum();
                    m = 0;
                    for (z = C.sceneObjects.length; m < z; ++m) {
                        F = C.sceneObjects[m];
                        D.bindSceneObject(F);
                        try {
                            F.getAABB();
                        } catch (T) {}
                    }
                    m = 0;
                    for (z = C.lights.length; m < z; ++m) (F = new Light()), r(C.lights[m], F), (F.trans = new Transform()), s(F), D.bindLight(F);
                    o(D);
                } else console.log("message from collada worker:", m.data.message);
            };
            r.onerror = function (a) {
                console.log("error from collada worker:", a.message);
            };
            r.postMessage({ message: "start", params: { meshUrl: e, prefix: m, rootDir: CubicVR.getScriptLocation() } });
        },
        InitWorker: function () {
            var a = { test: r, prepareMesh: m, file: o, sceneFile: q };
            self.addEventListener(
                "message",
                function (b) {
                    if (b.data.message === "init") {
                        var c = b.data.data.type;
                        if (c in a) new a[c](b.data.data.data);
                        else throw Error("Invalid worker type.");
                    }
                },
                !1
            );
        },
    };
});
/* Auto Embed ./CubicVR_Core.vs */
window.CubicVR.CubicVRCoreVS =
    "attribute vec3 aVertexPosition;\nattribute vec3 aNormal;\nattribute vec2 aTextureCoord;\n#if hasVertexColorMap\nattribute vec3 aColor;\nvarying vec3 cmapColor;\n#endif\n#if hasMorph\nattribute vec3 amVertexPosition;\nattribute vec3 amNormal;\nuniform float morphWeight;\n#endif\nvarying vec2 vTextureCoord;\n#if !perPixel\n#if lightPoint||lightDirectional||lightSpot||lightArea\nuniform vec3 lDir[loopCount];\nuniform vec3 lPos[loopCount];\nuniform vec3 lSpec[loopCount];\nuniform vec3 lDiff[loopCount];\nuniform float lInt[loopCount];\nuniform float lDist[loopCount];\n#if lightSpot\nuniform float lCut[loopCount];\n#endif\nvarying vec3 vColor;\nvarying vec3 vSpec;\n#endif\nuniform vec3 mDiff;\nuniform vec3 mSpec;\nuniform float mShine;\n#endif\nuniform mat4 uMVMatrix;\nuniform mat4 uPMatrix;\nuniform mat4 uOMatrix;\nuniform mat3 uNMatrix;\nvarying vec3 vNormal;\nvarying vec4 vPosition;\n#if !depthPack\n#if hasShadow\nvarying vec4 shadowProj[loopCount];\nuniform mat4 spMatrix[loopCount];\n#endif\n#if hasEnvSphereMap\n#if hasNormalMap\nvarying vec3 u;\n#else\nvarying vec2 vEnvTextureCoord;\n#endif\n#endif\n#if hasBumpMap||hasNormalMap\nvarying vec3 eyeVec;\n#endif\n#endif \nvoid main(void)\n{\nmat4 uMVOMatrix = uMVMatrix * uOMatrix;\nmat4 uMVPMatrix = uPMatrix * uMVMatrix;\n#if hasMorph\nvPosition = uMVOMatrix * vec4(aVertexPosition+(amVertexPosition-aVertexPosition)*morphWeight, 1.0);\ngl_Position = uMVPMatrix * uOMatrix * vec4(aVertexPosition+(amVertexPosition-aVertexPosition)*morphWeight, 1.0);\n#else\nvPosition = uMVOMatrix * vec4(aVertexPosition, 1.0);\ngl_Position = uMVPMatrix * uOMatrix * vec4(aVertexPosition, 1.0);\n#endif\nvTextureCoord = aTextureCoord;\n#if !depthPack\n#if hasVertexColorMap\ncmapColor = aColor;\n#endif\n#if hasMorph\nvNormal = uNMatrix * normalize(uOMatrix*vec4(aNormal+(amNormal-aNormal)*morphWeight,0.0)).xyz;\n#else\nvNormal = uNMatrix * normalize(uOMatrix*vec4(aNormal,0.0)).xyz;\n#endif\n#if !perPixel\n#if lightPoint\nvec3 specTotal = vec3(0.0,0.0,0.0);\nvec3 accum = vec3(0.0,0.0,0.0);\nfor (int i = 0; i < loopCount; i++) {\nvec3 lDir = lPos[i]-vPosition.xyz;\nfloat dist = length(lDir);\nvec3 halfVector = normalize(vec3(0.0,0.0,1.0)+lDir);\nfloat NdotL = max(dot(normalize(lDir),vNormal),0.0);\nif (NdotL > 0.0) {\nfloat att = clamp(((lDist[i]-dist)/lDist[i]), 0.0, 1.0)*lInt[i];\naccum += att * NdotL * lDiff[i] * mDiff;\nfloat NdotHV = max(dot(vNormal, halfVector),0.0);\nvec3 spec2 = lSpec[i] * mSpec * pow(NdotHV,mShine);\nspecTotal += spec2;\n}\n}\nvColor = accum;\nvSpec = specTotal;\n#endif\n#if lightDirectional\nfloat NdotL;\nfloat NdotHV = 0.0;\nvec3 specTotal = vec3(0.0,0.0,0.0);\nvec3 spec2 = vec3(0.0,0.0,0.0);\nvec3 accum = vec3(0.0,0.0,0.0);\nvec3 halfVector;\nfor (int i = 0; i < loopCount; i++) {\nhalfVector = normalize(vec3(0.0,0.0,1.0)-lDir[i]);\nNdotL = max(dot(normalize(-lDir[i]),vNormal),0.0);\nif (NdotL > 0.0)   {\naccum += lInt[i] * mDiff * lDiff[i] * NdotL;\nNdotHV = max(dot(vNormal, halfVector),0.0);\nspec2 = lSpec[i] * mSpec * pow(NdotHV,mShine);\nspecTotal += spec2;\n}\n}\nvColor = accum;\nvSpec = specTotal;\n#endif\n#if lightSpot\nvec3 specTotal = vec3(0.0,0.0,0.0);\nvec3 spec2 = vec3(0.0,0.0,0.0);\nvec3 accum = vec3(0.0,0.0,0.0);\nvec3 halfVector;\nfloat spotEffect;\nfloat spotDot;\nfloat power;\nfor (int i = 0; i < loopCount; i++) {\nvec3 l = lPos[i]-vPosition.xyz;\nfloat dist = length(l);\nfloat att = clamp(((lDist[i]-dist)/lDist[i]), 0.0, 1.0)*lInt[i];\natt = clamp(att,0.0,1.0);\nspotDot = dot(normalize(-l), normalize(lDir[i]));\nif ( spotDot < cos((lCut[i]/2.0)*(3.14159/180.0)) ) {\nspotEffect = 0.0;\n}\nelse {\nspotEffect = pow(spotDot, 1.0);\n}\natt *= spotEffect;\nvec3 v = normalize(-vPosition.xyz);\nvec3 h = normalize(l + v);\nfloat NdotL = max(0.0, dot(vNormal, normalize(l)));\nfloat NdotH = max(0.0, dot(vNormal, h));\nif (NdotL > 0.0) {\npower = pow(NdotH, mShine);\n}\nelse {\npower = 0.0;\n}\naccum += att * lDiff[i] * mDiff * NdotL;\nspec2 = lSpec[i] * mSpec * power;\nspecTotal += spec2*spotEffect;\n}\nvColor = accum;\nvSpec = specTotal;\n#endif\n#endif \n#if hasBumpMap||hasNormalMap\nvec3 tangent;\nvec3 binormal;\nvec3 c1 = cross( aNormal, vec3(0.0, 0.0, 1.0) );\nvec3 c2 = cross( aNormal, vec3(0.0, 1.0, 0.0) );\nif ( length(c1) > length(c2) )  {\ntangent = c1;\n}  else {\ntangent = c2;\n}\ntangent = normalize(tangent);\nbinormal = cross(aNormal, tangent);\nbinormal = normalize(binormal);\nmat3 TBNMatrix = mat3( (vec3 (uMVOMatrix * vec4 (tangent, 0.0))),\n(vec3 (uMVOMatrix * vec4 (binormal, 0.0))),\n(vec3 (uMVOMatrix * vec4 (aNormal, 0.0)))\n);\neyeVec = vec3(uMVOMatrix * vec4(aVertexPosition,1.0)) * TBNMatrix;\n#endif\n#if (lightSpot||lightArea) && hasShadow\nfor (int i = 0; i < loopCount; i++)\n{\n#if hasShadow\n#if hasMorph\nshadowProj[i] = spMatrix[i] * (uOMatrix * vec4(aVertexPosition+(amVertexPosition-aVertexPosition)*morphWeight, 1.0));\n#else\nshadowProj[i] = spMatrix[i] * (uOMatrix * vec4(aVertexPosition, 1.0));\n#endif\n#endif\n}\n#endif\n#if hasEnvSphereMap\n#if hasNormalMap\nu = normalize( vPosition.xyz );\n#else\nvec3 ws = (uMVMatrix * vec4(aVertexPosition,1.0)).xyz;\nvec3 u = normalize( vPosition.xyz );\nvec3 r = reflect(ws, vNormal );\nfloat m = 2.0 * sqrt( r.x*r.x + r.y*r.y + (r.z+1.0)*(r.z+1.0) );\nvEnvTextureCoord.s = r.x/m + 0.5;\nvEnvTextureCoord.t = r.y/m + 0.5;\n#endif\n#endif\n#endif \n}\n";
/* Auto Embed ./CubicVR_Core.fs */
window.CubicVR.CubicVRCoreFS =
    "#ifdef GL_ES\n#if perPixel\nprecision highp float;\n#else\nprecision highp float;\n#endif\n#endif\nuniform vec3 mAmb;\nuniform vec3 lAmb;\nuniform vec3 mColor;\n#if perPixel\nuniform vec3 mDiff;\nuniform vec3 mSpec;\nuniform float mShine;\n#if lightPoint||lightDirectional||lightSpot||lightArea\nuniform vec3 lDir[loopCount];\nuniform vec3 lPos[loopCount];\nuniform vec3 lSpec[loopCount];\nuniform vec3 lDiff[loopCount];\nuniform float lInt[loopCount];\nuniform float lDist[loopCount];\n#if lightSpot\nuniform float lCut[loopCount];\n#endif\n#endif\n#if hasProjector\nuniform sampler2D lProjTex[loopCount];\n#endif\n#if hasShadow\nvarying vec4 shadowProj[loopCount];\nuniform sampler2D lDepthTex[loopCount];\nuniform vec3 lDepth[loopCount];\n#endif\n#else \nvarying vec3 vColor;\nvarying vec3 vSpec;\n#endif  \nvarying vec3 vNormal;\nvarying vec2 vTextureCoord;\n#if hasVertexColorMap\nvarying vec3 cmapColor;\n#endif\n#if alphaDepth||depthPack||hasShadow\nuniform vec3 depthInfo;\nfloat ConvertDepth3(float d) { return (depthInfo.x*depthInfo.y)/(depthInfo.y-d*(depthInfo.y-depthInfo.x));  }\nfloat DepthRange( float d ) { return ( d - depthInfo.x ) / ( depthInfo.y - depthInfo.x ); }\nfloat ConvertDepth3A(float d, float near, float far) { return (near*far)/(far-d*(far-near));  }\nfloat DepthRangeA( float d, float near, float far ) { return ( d - near ) / ( far - near ); }\n#endif\n#if depthPack\nvec4 packFloatToVec4i(const float value)\n{\nconst vec4 bitSh = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);\nconst vec4 bitMsk = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);\nvec4 res = fract(value * bitSh);\nres -= res.xxyz * bitMsk;\nreturn res;\n}\n#endif\n#if hasShadow\nfloat unpackFloatFromVec4i(const vec4 value)\n{\nconst vec4 bitSh = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);\nreturn(dot(value, bitSh));\n}\n#if softShadow\nfloat getShadowVal(sampler2D shadowTex,vec4 shadowCoord, float proj, float texel_size) {\nvec2 filterTaps[6];\nfilterTaps[0] = vec2(-0.326212,-0.40581);\nfilterTaps[1] = vec2(-0.840144,-0.07358);\nfilterTaps[2] = vec2(-0.695914,0.457137);\nfilterTaps[3] = vec2(-0.203345,0.620716);\nfilterTaps[4] = vec2(0.96234,-0.194983);\nfilterTaps[5] = vec2(0.473434,-0.480026);\n/*  filterTaps[6] = vec2(0.519456,0.767022);\nfilterTaps[7] = vec2(0.185461,-0.893124);\nfilterTaps[8] = vec2(0.507431,0.064425);\nfilterTaps[9] = vec2(0.89642,0.412458) ;\nfilterTaps[10] =vec2(-0.32194,-0.932615);\nfilterTaps[11] =vec2(-0.791559,-0.59771); */\nfloat shadow = 0.0;\nvec4  shadowSample;\nfloat distanceFromLight;\nfor (int i = 0; i < 6; i++) {\nshadowSample = texture2D(shadowTex,shadowCoord.st+filterTaps[i]*(2.0*texel_size));\ndistanceFromLight = unpackFloatFromVec4i(shadowSample);\nshadow += distanceFromLight <= shadowCoord.z ? 0.0 : 1.0 ;\n}\nshadow /= 6.0;\nreturn shadow;\n}\n#else\nfloat getShadowVal(sampler2D shadowTex,vec4 shadowCoord, float proj, float texel_size) {\nvec4 shadowSample = texture2D(shadowTex,shadowCoord.st);\nfloat distanceFromLight = unpackFloatFromVec4i(shadowSample);\nfloat shadow = 1.0;\nshadow = distanceFromLight <= (shadowCoord.z) ? 0.0 : 1.0 ;\nreturn shadow;\n}\n#endif\n#endif\n#if !depthPack\n#if hasColorMap\nuniform sampler2D colorMap;\n#endif\n#if hasBumpMap\nvarying vec3 eyeVec;\nuniform sampler2D bumpMap;\n#endif\n#if hasEnvSphereMap\nuniform sampler2D envSphereMap;\nuniform float envAmount;\n#if hasNormalMap\nvarying vec3 u;\n#else\nvarying vec2 vEnvTextureCoord;\n#endif\n#endif\n#if hasReflectMap\nuniform sampler2D reflectMap;\n#endif\n#if hasNormalMap\nuniform sampler2D normalMap;\n#endif\nuniform float mAlpha;\n#if hasAmbientMap\nuniform sampler2D ambientMap;\n#endif\n#if hasSpecularMap\nuniform sampler2D specularMap;\n#endif\n#endif \n#if hasAlphaMap\nuniform sampler2D alphaMap;\n#endif\nvarying vec4 vPosition;\nuniform mat4 uPMatrix;\nvoid main(void)\n{\n#if depthPack\nvec2 texCoord = vTextureCoord;\n#else\nvec3 n;\nvec4 color = vec4(0.0,0.0,0.0,0.0);\n#if hasBumpMap\nfloat height = texture2D(bumpMap, vTextureCoord.xy).r;\nfloat v = (height) * 0.05 - 0.04; \nvec3 eye = normalize(eyeVec);\nvec2 texCoord = vTextureCoord.xy + (eye.xy * v);\n#else\nvec2 texCoord = vTextureCoord;\n#endif\n#if hasNormalMap\nvec3 bumpNorm = vec3(texture2D(normalMap, texCoord));\nn = (vec4(normalize(vNormal),1.0)).xyz;\nbumpNorm = (bumpNorm-0.5)*2.0;\nbumpNorm.y = -bumpNorm.y;\nn = normalize((n+bumpNorm)/2.0);\n#else\nn = normalize(vNormal);\n#endif\n#if hasColorMap\n#if !(lightPoint||lightDirectional||lightSpot||lightArea)\ncolor = texture2D(colorMap, vec2(texCoord.s, texCoord.t)).rgba;\ncolor.rgb *= mColor;\n#else\ncolor = texture2D(colorMap, vec2(texCoord.s, texCoord.t)).rgba;\ncolor.rgb *= mColor;\n#endif\nif (color.a<=0.9) discard;\n#else\n#if hasVertexColorMap\ncolor = vec4(cmapColor,1.0);\n#else\ncolor = vec4(mColor,1.0);\n#endif\n#endif\n#if hasAlphaMap\ncolor.a = texture2D(alphaMap, texCoord).r;\n#if alphaDepth\nif (color.a < 0.9) discard;\n#else\n#if !hasAlpha\nif (color.a<0.9) discard;\n#else\nif (color.a==0.0) discard;\n#endif\n#endif\n#else\n#if hasAlpha\ncolor.a = mAlpha;\n#endif\n#endif\nvec3 accum = lAmb;\n#if perPixel\n#if lightPoint\nvec3 specTotal = vec3(0.0,0.0,0.0);\nfor (int i = 0; i < loopCount; i++) {\nvec3 lDir = lPos[i]-vPosition.xyz;\nfloat dist = length(lDir);\nvec3 halfVector = normalize(vec3(0.0,0.0,1.0)+lDir);\nfloat NdotL = max(dot(normalize(lDir),n),0.0);\nif (NdotL > 0.0) {\nfloat att = clamp(((lDist[i]-dist)/lDist[i]), 0.0, 1.0)*lInt[i];\naccum += att * NdotL * lDiff[i] * mDiff;\nfloat NdotHV = max(dot(n, halfVector),0.0);\n#if hasSpecularMap\nvec3 spec2 = lSpec[i] * texture2D(specularMap, vec2(texCoord.s, texCoord.t)).rgb * pow(NdotHV,mShine);\n#else\nvec3 spec2 = lSpec[i] * mSpec * pow(NdotHV,mShine);\n#endif\nspecTotal += spec2;\n}\n}\ncolor.rgb *= accum;\ncolor.rgb += specTotal;\n#endif\n#if lightDirectional\nfloat NdotL;\nfloat NdotHV = 0.0;\nvec3 specTotal = vec3(0.0,0.0,0.0);\nvec3 spec2 = vec3(0.0,0.0,0.0);\nvec3 halfVector;\nfor (int i = 0; i < loopCount; i++) {\nhalfVector = normalize(vec3(0.0,0.0,1.0)-lDir[i]);\nNdotL = max(dot(normalize(-lDir[i]),n),0.0);\nif (NdotL > 0.0)   {\naccum += lInt[i] * mDiff * lDiff[i] * NdotL;\nNdotHV = max(dot(n, halfVector),0.0);\n#if hasSpecularMap\nspec2 = lSpec[i] * texture2D(specularMap, vec2(texCoord.s, texCoord.t)).rgb * pow(NdotHV,mShine);\n#else\nspec2 = lSpec[i] * mSpec * pow(NdotHV,mShine);\n#endif\nspecTotal += spec2;\n}\n}\ncolor.rgb *= accum;\ncolor.rgb += specTotal;\n#endif\n#if lightArea\nvec3 specTotal = vec3(0.0,0.0,0.0);\nvec3 spec2 = vec3(0.0,0.0,0.0);\nfloat NdotL;\nfloat NdotHV = 0.0;\nvec3 halfVector;\nfor (int i = 0; i < loopCount; i++) {\nhalfVector = normalize(vec3(0.0,0.0,1.0)-lDir[i]);\nNdotL = max(dot(normalize(-lDir[i]),n),0.0);\nif (NdotL > 0.0)   {\nNdotHV = max(dot(n, halfVector),0.0);\n#if hasShadow\nvec4 shadowCoord = shadowProj[i] / shadowProj[i].w;\nshadowCoord.z = DepthRangeA(ConvertDepth3A(shadowCoord.z,lDepth[i].x,lDepth[i].y),lDepth[i].x,lDepth[i].y);\nvec4 shadowSample;\nfloat shadow = 1.0;\nif (shadowCoord.s > 0.000&&shadowCoord.s < 1.000 && shadowCoord.t > 0.000 && shadowCoord.t < 1.000) if (i == 0) { shadow = getShadowVal(lDepthTex[0],shadowCoord,shadowProj[i].w,lDepth[i].z);}\n#if loopCount>1\nelse if (i == 1) { shadow = getShadowVal(lDepthTex[1],shadowCoord,shadowProj[i].w,lDepth[i].z); }\n#endif\n#if loopCount>2\nelse if (i == 2) { shadow = getShadowVal(lDepthTex[2],shadowCoord,shadowProj[i].w,lDepth[i].z); }\n#endif\n#if loopCount>3\nelse if (i == 3) { shadow = getShadowVal(lDepthTex[3],shadowCoord,shadowProj[i].w,lDepth[i].z);  }\n#endif\n#if loopCount>4\nelse if (i == 4) { shadow = getShadowVal(lDepthTex[4],shadowCoord,shadowProj[i].w,lDepth[i].z);  }\n#endif\n#if loopCount>5\nelse if (i == 5) { shadow = getShadowVal(lDepthTex[5],shadowCoord,shadowProj[i].w,lDepth[i].z);  }\n#endif\n#if loopCount>6\nelse if (i == 6) { shadow = getShadowVal(lDepthTex[6],shadowCoord,shadowProj[i].w,lDepth[i].z);  }\n#endif\n#if loopCount>7\nelse if (i == 7) { shadow = getShadowVal(lDepthTex[7],shadowCoord,shadowProj[i].w,lDepth[i].z); }\n#endif\naccum += shadow * lInt[i] * mDiff * lDiff[i] * NdotL;\n#else\naccum += lInt[i] * mDiff * lDiff[i] * NdotL;\n#endif\n#if hasSpecularMap\nspec2 = lSpec[i] * texture2D(specularMap, vec2(texCoord.s, texCoord.t)).rgb * pow(NdotHV,mShine);\n#else\nspec2 = lSpec[i] * mSpec * pow(NdotHV,mShine);\n#endif\n#if hasShadow\nspec2 *= shadow;\n#endif\nspecTotal += spec2;\n#if hasShadow\n#endif\n}\n}\ncolor.rgb *= accum;\ncolor.rgb += specTotal;\n#endif\n#if lightSpot\nvec3 specTotal = vec3(0.0,0.0,0.0);\nvec3 spec2 = vec3(0.0,0.0,0.0);\nvec3 halfVector;\nfloat spotEffect;\nfloat spotDot;\nfloat power;\nfor (int i = 0; i < loopCount; i++) {\nvec3 l = lPos[i]-vPosition.xyz;\nfloat dist = length(l);\nfloat att = clamp(((lDist[i]-dist)/lDist[i]), 0.0, 1.0)*lInt[i];\natt = clamp(att,0.0,1.0);\nspotDot = dot(normalize(-l), normalize(lDir[i]));\nif ( spotDot < cos((lCut[i]/2.0)*(3.14159/180.0)) ) {\nspotEffect = 0.0;\n}\nelse {\nspotEffect = pow(spotDot, 1.0);\n}\n#if !hasProjector\natt *= spotEffect;\n#endif\nvec3 v = normalize(-vPosition.xyz);\nvec3 h = normalize(l + v);\nfloat NdotL = max(0.0, dot(n, normalize(l)));\nfloat NdotH = max(0.0, dot(n, h));\nif (NdotL > 0.0) {\npower = pow(NdotH, mShine);\n}\nelse {\npower = 0.0;\n}\n#if hasShadow\nvec4 shadowCoord = shadowProj[i] / shadowProj[i].w;\nshadowCoord.z = DepthRangeA(ConvertDepth3A(shadowCoord.z,lDepth[i].x,lDepth[i].y),lDepth[i].x,lDepth[i].y);\nvec4 shadowSample;\nfloat shadow = 1.0;\nif (shadowCoord.s >= 0.000&&shadowCoord.s <= 1.000 && shadowCoord.t >= 0.000 && shadowCoord.t <= 1.000) if (i == 0) { shadow = getShadowVal(lDepthTex[0],shadowCoord,shadowProj[i].w,lDepth[i].z);}\n#if loopCount>1\nelse if (i == 1) { shadow = getShadowVal(lDepthTex[1],shadowCoord,shadowProj[i].w,lDepth[i].z); }\n#endif\n#if loopCount>2\nelse if (i == 2) { shadow = getShadowVal(lDepthTex[2],shadowCoord,shadowProj[i].w,lDepth[i].z); }\n#endif\n#if loopCount>3\nelse if (i == 3) { shadow = getShadowVal(lDepthTex[3],shadowCoord,shadowProj[i].w,lDepth[i].z);  }\n#endif\n#if loopCount>4\nelse if (i == 4) { shadow = getShadowVal(lDepthTex[4],shadowCoord,shadowProj[i].w,lDepth[i].z);  }\n#endif\n#if loopCount>5\nelse if (i == 5) { shadow = getShadowVal(lDepthTex[5],shadowCoord,shadowProj[i].w,lDepth[i].z);  }\n#endif\n#if loopCount>6\nelse if (i == 6) { shadow = getShadowVal(lDepthTex[6],shadowCoord,shadowProj[i].w,lDepth[i].z);  }\n#endif\n#if loopCount>7\nelse if (i == 7) { shadow = getShadowVal(lDepthTex[7],shadowCoord,shadowProj[i].w,lDepth[i].z); }\n#endif\natt = att * shadow;\n#endif\n#if hasProjector && hasShadow\nif (shadowCoord.s >= 0.0&&shadowCoord.s <= 1.0 && shadowCoord.t >= 0.0 && shadowCoord.t <= 1.0 && spotDot > cos((90.0)*(3.14159/180.0))) {\nvec3 projTex = texture2D(lProjTex[i],shadowCoord.st).rgb;\naccum += att * projTex * lInt[i] * mDiff * lDiff[i] * NdotL;\n}\n#else\naccum += att * lDiff[i] * mDiff * NdotL;\n#endif\n#if hasSpecularMap\nspec2 = lSpec[i] * texture2D(specularMap, vec2(texCoord.s, texCoord.t)).rgb * power;\n#else\nspec2 = lSpec[i] * mSpec * power;\n#endif\n#if hasShadow\nspec2 *= shadow;\n#endif\nspecTotal += spec2*spotEffect;\n}\ncolor.rgb *= accum;\ncolor.rgb += specTotal;\n#if hasShadow\n#endif\n#endif\n#else\n#if lightPoint||lightDirectional||lightSpot||lightArea\ncolor.rgb *= vColor;\ncolor.rgb += vSpec;\n#endif\n#endif \n#if hasReflectMap\nfloat environmentAmount = texture2D( reflectMap, texCoord).r;\n#endif\n#if hasEnvSphereMap\n#if hasNormalMap\nvec3 r = reflect( u, n );\nfloat m = 2.0 * sqrt( r.x*r.x + r.y*r.y + (r.z+1.0)*(r.z+1.0) );\nvec3 coord;\ncoord.s = r.x/m + 0.5;\ncoord.t = r.y/m + 0.5;\n#if hasReflectMap\ncolor.rgb += mColor*accum*texture2D( envSphereMap, coord.st).rgb * environmentAmount;\n#else\ncolor.rgb += mColor*accum*texture2D( envSphereMap, coord.st).rgb * envAmount;\n#endif\n#else\n#if hasReflectMap\ncolor.rgb += mColor*accum*texture2D( envSphereMap, vEnvTextureCoord).rgb * environmentAmount;\n#else\ncolor.rgb += mColor*accum*texture2D( envSphereMap, vEnvTextureCoord).rgb*envAmount;\n#endif\n#endif\n#endif\n#if hasAmbientMap\n#if lightPoint||lightDirectional||lightSpot||lightArea\ncolor.rgb += texture2D(ambientMap, texCoord).rgb*(vec3(1.0,1.0,1.0)+mColor*mAmb);\n#else\ncolor.rgb = color.rgb*texture2D(ambientMap, texCoord).rgb;\n#endif\n#else\n#if !hasColorMap\ncolor.rgb += mColor*mAmb;\n#else\ncolor.rgb += mAmb*texture2D(colorMap, texCoord).rgb;\n#endif\n#endif\n#if alphaDepth\n#if !hasAlpha\nfloat linear_depth = DepthRange( ConvertDepth3(gl_FragCoord.z) );\ncolor.a = linear_depth;\n#endif\n#endif\ngl_FragColor = clamp(color,0.0,1.0);\n#endif \n#if depthPack\n#if hasAlphaMap\nfloat alphaVal = texture2D(alphaMap, texCoord).r;\nif (alphaVal < 0.9) discard;\n#endif\ngl_FragColor = packFloatToVec4i(DepthRange( ConvertDepth3(gl_FragCoord.z)));\n#endif\n}\n";
