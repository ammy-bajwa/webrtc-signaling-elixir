defmodule WebrtcSignalingWeb.Router do
  use WebrtcSignalingWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", WebrtcSignalingWeb do
    pipe_through :api
  end
end
