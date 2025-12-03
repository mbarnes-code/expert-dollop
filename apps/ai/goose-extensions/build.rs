fn main() {
    #[cfg(feature = "napi-module")]
    {
        napi_build::setup();
    }
}
