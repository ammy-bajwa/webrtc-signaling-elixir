defmodule WebrtcSignalingWeb.RoomChannel do
  use WebrtcSignalingWeb, :channel

  def join("channel:signal", %{}, socket) do
    {:ok, %{}, socket}
  end
end
