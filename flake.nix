{
  description = "OpenBrief development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (
        pkgs:
        let
          inherit (pkgs) lib stdenv;

          commonPackages = with pkgs; [
            # Renderer / workspace (client/package.json engines)
            nodejs_22
            pnpm_11

            # Rust trusted boundary and helper sidecar
            rustc
            cargo
            clippy
            rustfmt
            rust-analyzer
            cargo-tauri

            # Native builds: whisper-cpp (transcribe-rs), bundled sqlite
            cmake
            pkg-config

            # Supertonic / Local AI PyInstaller sidecars (localai needs 3.10-3.12)
            python311

            git
          ];

          # Tauri v2 Linux prerequisites, mirroring .github/workflows/release.yml
          linuxLibraries = with pkgs; [
            webkitgtk_4_1
            gtk3
            glib
            glib-networking
            cairo
            pango
            gdk-pixbuf
            atk
            libsoup_3
            librsvg
            libayatana-appindicator
            alsa-lib
            openssl
            dbus
          ];

          rustSrc = "${pkgs.rustPlatform.rustLibSrc}";
        in
        {
          default =
            if stdenv.hostPlatform.isDarwin then
              # macOS: use the system Xcode toolchain for clang, the Apple SDK,
              # `swift` (FluidAudio sidecar) and `codesign` (dev media tools).
              # Nix's cc wrapper and SDK would shadow them and break `swift build`.
              pkgs.mkShellNoCC {
                packages = commonPackages;
                RUST_SRC_PATH = rustSrc;
                shellHook = ''
                  unset DEVELOPER_DIR SDKROOT
                  if ! /usr/bin/xcrun --find swift >/dev/null 2>&1; then
                    echo "warning: Xcode (or Command Line Tools) with swift not found; run 'xcode-select --install'." >&2
                  fi
                '';
              }
            else
              pkgs.mkShell {
                packages =
                  commonPackages
                  ++ linuxLibraries
                  ++ (with pkgs; [
                    clang
                    patchelf
                    file
                    xdg-utils
                  ]);

                RUST_SRC_PATH = rustSrc;
                # bindgen (whisper-rs-sys)
                LIBCLANG_PATH = "${pkgs.llvmPackages.libclang.lib}/lib";
                # GIO TLS backend for WebKitGTK network requests
                GIO_MODULE_DIR = "${pkgs.glib-networking}/lib/gio/modules/";
                # Runtime libraries for the webview and for pip-installed wheels
                # (onnxruntime, etc.) used by the PyInstaller sidecars.
                LD_LIBRARY_PATH = lib.makeLibraryPath (linuxLibraries ++ [ stdenv.cc.cc.lib ]);
                # Avoid blank windows with WebKitGTK's DMA-BUF renderer on some GPUs
                WEBKIT_DISABLE_DMABUF_RENDERER = "1";
              };
        }
      );

      formatter = forAllSystems (pkgs: pkgs.nixfmt-rfc-style);
    };
}
