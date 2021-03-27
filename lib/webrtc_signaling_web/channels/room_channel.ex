defmodule WebrtcSignalingWeb.RoomChannel do
  use WebrtcSignalingWeb, :channel

  def join("channel:signal", %{}, socket) do
    {:ok, %{}, socket}
  end

  def handle_in("channel:sendOffer", %{"sender" => sender, "offer" => offer}, socket) do
    broadcast!(socket, "channel:onOffer", %{"sender" => sender, "offer" => offer})
    {:noreply, socket}
  end

  def handle_in("channel:sendOfferFilePC", %{"sender" => sender, "offer" => offer, "fileName" => file_name}, socket) do
    broadcast!(socket, "channel:onOfferFilePC__#{file_name}", %{"sender" => sender, "offer" => offer, "fileName" => file_name})
    {:noreply, socket}
  end

  def handle_in("channel:sendAnswer", %{"sender" => sender, "answer" => answer}, socket) do
    broadcast!(socket, "channel:onAnswer", %{"sender" => sender, "answer" => answer})
    {:noreply, socket}
  end

  def handle_in("channel:sendAnswerFilePC", %{"sender" => sender, "answer" => answer, "fileName" => file_name}, socket) do
    broadcast!(socket, "channel:onAnswerFilePC__#{file_name}", %{"sender" => sender, "answer" => answer, "fileName" => file_name})
    {:noreply, socket}
  end

  def handle_in("channel:sendIce", %{"sender" => sender, "candidate" => candidate}, socket) do
    broadcast!(socket, "channel:onCandidate", %{"sender" => sender, "candidate" => candidate})
    {:noreply, socket}
  end

  def handle_in("channel:sendIceFilePC", %{"sender" => sender, "candidate" => candidate, "fileName" => file_name}, socket) do
    broadcast!(socket, "channel:onCandidateFilePC__#{file_name}", %{"sender" => sender, "candidate" => candidate})
    {:noreply, socket}
  end

end
