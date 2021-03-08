defmodule WebrtcSignalingWeb.RoomChannel do
  use WebrtcSignalingWeb, :channel

  def join("channel:signal", %{}, socket) do
    {:ok, %{}, socket}
  end


  def handle_in("channel:sendOffer", %{"sender" => sender, "offer" => offer}, socket) do
    broadcast!(socket, "channel:onOffer", %{"sender" => sender, "offer" => offer})
    {:noreply, socket}
  end

end
