"use client";

export default function KakaoLoginButton() {
  const handleLogin = () => {
    const clientId = "여기에_카카오_REST_API_KEY";

    const redirectUri =
      "https://certain-mallard-36.clerk.accounts.dev/oauth/callback";

    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;

    window.location.href = kakaoAuthUrl;
  };

  return (
    <button
      onClick={handleLogin}
      style={{
        padding: "12px 20px",
        backgroundColor: "#FEE500",
        border: "none",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: "pointer",
        marginTop: "20px",
      }}
    >
      카카오로 로그인
    </button>
  );
}