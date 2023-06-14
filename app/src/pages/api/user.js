
import { withNextSession } from "@/lib/session";

function userRoute(req, res) {
  if (req.session.user) {
    return res.status(200).json(req.session.user)
  } else {
    res.status(200).json(null)
  }
}

export default withNextSession(userRoute)